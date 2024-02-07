let Account = require("../models/account");
let mailController = require('./MailController')
let multiparty = require('multiparty') // upload file
let fsx = require('fs-extra'); // upload file
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Load user lên trang quản lí
function getAccountManagementPage(req, res) {
    Account.find()
    .lean() // convert Mongoose Object Array thành Javascript Object Array
    .then(accounts => {
        const ITEMS_PER_PAGE = 8; // Số lượng item mỗi trang
        const page = parseInt(req.query.page) || 1; // Lấy số trang hiện tại
        const nextPage = page + 1;
        const prevPage = page - 1;
        const skip = (page - 1) * ITEMS_PER_PAGE;

        // Lọc ra các account mà không phải là admin
        const accountsNotAdmin = accounts.filter(a => a.email !== "admin@gmail.com");
        const totalAccountsNotAdmin  = accountsNotAdmin.length;
        const totalPages = Math.ceil(totalAccountsNotAdmin / ITEMS_PER_PAGE);
        const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

        const paginatedAccountsNotAdmin = accountsNotAdmin.slice(skip, skip + ITEMS_PER_PAGE);

        res.render('accountManagement', {
            layout: "admin", 
            accounts: paginatedAccountsNotAdmin,
            currentPage: page,
            nextPage: nextPage,
            prevPage: prevPage,
            totalPages: totalPages,
            pages: pages
        });
    })
}

// Đăng ký
async function addAccount(req, res) {
    // Kiểm tra tính hợp lệ của dữ liệu
    if(req.body.email === "" || req.body.fullname === "") {
        req.flash("error", "Vui lòng không bỏ trống thông tin");
        return res.render("signup", {error: req.flash("error"), email: req.body.email, fullname: req.body.fullname});
    }
        
    if(!mailController.isEmail(req.body.email)) {
        req.flash("error", "Email không hợp lệ");
        return res.render("signup", {error: req.flash("error"), email: req.body.email, fullname: req.body.fullname});
    }

    if((await mailController.checkEmailExistence(req.body.email)) === false) {
        req.flash("error", "Địa chỉ email không tồn tại");
        return res.render("signup", {error: req.flash("error"), email: req.body.email, fullname: req.body.fullname});
    }

    let account = new Account({
        email: req.body.email, 
        password: (req.body.email).split("@")[0], // mật khẩu khi mới tạo sẽ là username (phần trước dấu @)
        fullname: req.body.fullname,
        profilePicture: "default-avatar.png",
        activateStatus: 0, // tài khoản mới tạo mặc định chưa được activate (tức là chưa click vào đường dẫn trong email)
        isNewUser: 1, // tài khoản mới tạo mặc định là user mới
        lockedStatus: 0 // tài khoản mới tạo mặc định chưa bị khóa
    });

    account.save()
    .then(newAccount => {
        resendEmail(req, res);
        
        req.flash("success", "Đăng ký tài khoản thành công. Vui lòng kiểm tra email của bạn.");
        res.render("signup", {success: req.flash("success")});
    })
    .catch(error => {
        req.flash("error", "Email này đã tồn tại");
        res.render("signup", {error: req.flash("error"), email: req.body.email, fullname: req.body.fullname});
    });
}

// Đăng nhập
function findAccount(req, res) {
    let username = req.body.username;
    let password = req.body.password;

    if(username === "" || password === "") {
        req.flash("error", "Vui lòng không bỏ trống thông tin")
        return res.render("login", {error: req.flash("error"), username: username, password: password})
    }

    let email = username + "@gmail.com";

    Account.findOne({
        email: email,
        password: password
    })
    .then(async account => {
        if(!account) {
            req.flash("error", "Tài khoản hoặc mật khẩu không chính xác")
            return res.render("login", {error: req.flash("error"), username: username, password: password, token: req.body.token})
        }

        if(account.lockedStatus === 1) {
            req.flash("error", "Tài khoản của bạn đã bị khóa.")
            return res.render("login", {error: req.flash("error")})
        }

        // User chưa kích hoạt tài khoản
        if(account.activateStatus === 0) {
            // Người dùng KHÔNG truy cập trang login thông qua đường link trong email
            if(!req.body.token || !bcrypt.compareSync(email, req.body.hashedEmail)) {
                req.flash("error", "Vui lòng nhấn vào đường link được gửi đến email của bạn.")
                return res.render("login", {error: req.flash("error")})
            }

            await Account.updateOne({email: email}, {$set: {activateStatus: 1}}, { new: true })

            req.session.email = email;
            return res.redirect("changepwd_logout")
        }

        // user mới
        if(account.isNewUser === 1)
            return res.redirect("changepwd_logout")

        req.session.email = email;
        
        if(email === "admin@gmail.com")
            res.redirect("/product-management")
        else
            res.redirect("/")
    })
    .catch(error => {
        req.flash("error", "Có lỗi xảy ra trong quá trình đăng nhập. Vui lòng thử lại sau.")
        res.render("login", {error: req.flash("error"), username: username, password: password})
    });
} 

// Load trang profile dựa vào session
function getProfilePage(req, res) {
    Account.findOne({
        email: req.session.email,
    })
    .then(account => {
        let options = {
            email: account.email, 
            fullname: account.fullname, 
            profilePicture: account.profilePicture, 
            success: req.flash("success"), 
            error: req.flash("error")
        };

        res.render("profile", options)
    })
}

// Cập nhật avatar
function changeProfilePicture(req, res) {
    let form = new multiparty.Form()

    form.parse(req, (error, data, files) => {
        if (error) {
            req.flash("error", "Thay đổi ảnh thất bại.")
            return res.redirect('profile')
        }
        
        let file = files.file[0];
        
        // Validate file
        if(file.size > 1048576) {
            req.flash("error", "Không chấp nhận ảnh có kích thước lớn hơn 1MB.")
            return res.redirect('profile')
        }

        // Đổi tên file là username + extension
        let newFileName = (req.session.email).split("@")[0] + path.extname(file.originalFilename);

        // Lưu file đã được upload vào server
        let tempPath = file.path;
        let savePath = path.join(__dirname, "../public/uploads/avatars/", newFileName);

        fsx.copy(tempPath, savePath, (err) => {
            if (err) {
                req.flash("error", "Thay đổi ảnh thất bại.")
                return res.redirect('profile')
            }
        });

        // Cập nhật lại giá trị của profilePicture trong database    
        Account.updateOne({email: req.session.email}, {$set: {profilePicture: newFileName}}, { new: true })
        .then(updatedAccount => {
            if (!updatedAccount) 
                req.flash("error", "Thay đổi ảnh thất bại.")
            else 
                req.flash("success", "Thay đổi ảnh thành công.")
                
            res.redirect('profile')
        })
        .catch(error => {
            req.flash("error", "Thay đổi ảnh thất bại.")
            res.redirect('profile')
        });
    })
}

// Đổi mật khẩu
function changePassword(req, res) {
    Account.findOne({
        email: req.session.email,
    })
    .then(async account => {
        let currentPassword = req.body.currentPassword;
        let newPassword = req.body.newPassword;
        let confirmPassword = req.body.confirmPassword;

        if(currentPassword === "" || newPassword === "" || confirmPassword === "")
            req.flash("error", "Vui lòng không bỏ trống thông tin")
        else if(currentPassword !== account.password)
            req.flash("error", "Mật khẩu hiện tại không chính xác");
        else if(newPassword !== confirmPassword)
            req.flash("error", "Nhập lại mật khẩu mới không chính xác");
        else {
            // Cập nhật lại mật khẩu mới trong database    
            await Account.updateOne({email: req.session.email}, {$set: {password: newPassword}}, { new: true })
            .then(updatedAccount => {
                if (!updatedAccount) 
                    req.flash("error", "Đổi mật khẩu thất bại.")
                else 
                    req.flash("success", "Đổi mật khẩu thành công. Vui lòng đăng nhập lại."); 
            })
            .catch(error => {
                req.flash("error", "Đổi mật khẩu thất bại.")
            });
        }
            
        let options = {
            currentPassword: currentPassword, 
            newPassword: newPassword, 
            confirmPassword: confirmPassword, 
            error: req.flash("error"),
            success: req.flash("success")
        };
    
        res.json(options)
    })
}

// Khởi tạo 1 số dữ liệu mẫu để chạy chương trình
async function initData() {
    // Trước khi khởi tạo dữ liệu mẫu thì ta cần xóa các dữ liệu hiện có
    await Account.deleteMany()

    // Tài khoản admin
    let account = new Account({
        email: "admin@gmail.com", 
        password: "admin",
        fullname: "Administrator",
        profilePicture: "default-avatar.png",
        activateStatus: 1,
        isNewUser: 0,
        lockedStatus: 0
    });

    await account.save()

    let account2 = new Account({
        email: "nghiem7755@gmail.com", 
        password: "nghiem7755",
        fullname: "Nguyễn Khắc Nghiêm",
        profilePicture: "default-avatar.png",
        activateStatus: 1,
        isNewUser: 1,
        lockedStatus: 0
    });

    await account2.save()

    let account3 = new Account({
        email: "anhtri000@gmail.com", 
        password: "anhtri000",
        fullname: "Lê Phạm Anh Trí",
        profilePicture: "default-avatar.png",
        activateStatus: 1,
        isNewUser: 0,
        lockedStatus: 0
    });

    await account3.save()

    let account4 = new Account({
        email: "caonguyenbinh12@gmail.com", 
        password: "caonguyenbinh12",
        fullname: "Cao Nguyên Bình",
        profilePicture: "default-avatar.png",
        activateStatus: 0,
        isNewUser: 1,
        lockedStatus: 0
    });

    await account4.save()
}

// Load profile user theo email tại trang quản lí
function getProfileByEmail(req, res) {
    Account.findOne({
        email: req.params.email,
    })
    .then(account => {
        let options = {
            layout: "admin",
            email: account.email, 
            fullname: account.fullname, 
            profilePicture: account.profilePicture, 
            success: req.flash("success"), 
            error: req.flash("error")
        };

        res.render("profileid", options)
    })
}

function lockUser(req, res) {
    Account.findOne({
        email: req.body.email,
    })
    .then(async account => {
        let updatedField;

        if(account.lockedStatus === 0) {
            updatedField = {
                $set: {
                    lockedStatus: 1
                }
            }
        }
        else {
            updatedField = {
                $set: {
                    lockedStatus: 0
                }
            }
        }

        await Account.updateOne({email: req.body.email}, updatedField, { new: true })
        .then(updatedAccount => {
            res.end();
        })
    })
}

function resendEmail(req, res) {
    let email = req.body.email;
    let subject = "Xác thực tài khoản";

    // Tạo token với thời gian hết hạn là 60 giây
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: 60 });

    // Sử dụng bcrypt để tạo hash của email
    const hashedEmail = bcrypt.hashSync(email, 3);

    // Tạo đường link với token và hash của email
    let content = `<a href="${process.env.APP_URL}/login?token=${token}&hashedEmail=${hashedEmail}"> Vui lòng nhấn vào đây để hoàn tất thủ tục tài khoản</a>`;
    mailController.sendMail(email, subject, content);	
}

function getChangePwdLogPage(req, res) {    
    Account.findOne({
        email: req.session.email
    })
    .then(account => {
        if(account.isNewUser === 1)
            res.render('changepwd_logout', {layout: null, email: req.session.email});
        else
            res.redirect('/login');
    })
}

// Đổi mật khẩu không cần pass cũ và cập nhật isNewUser
function changePwdNoPassOld(req, res) {
    Account.findOne({
        email: req.session.email,
    })
    .then(async account => {
        let currentPassword = account.password;
        let newPassword = req.body.newPassword;
        let confirmPassword = req.body.confirmPassword;
        let isNewUser = account.isNewUser;

        if(newPassword === "" || confirmPassword === "")
            req.flash("error", "Vui lòng không bỏ trống thông tin")
        else if(newPassword !== confirmPassword)
            req.flash("error", "Nhập lại mật khẩu mới không chính xác");
        else {
            let updatedField;
    
            updatedField = {
                $set: {
                    isNewUser: 0,
                    password: newPassword
                }
            }

            // Cập nhật lại mật khẩu mới và isNewUser trong database    
            await Account.updateOne({email: req.session.email}, updatedField, { new: true })
            .then(updatedAccount => {
                if (!updatedAccount) 
                    req.flash("error", "Đổi mật khẩu thất bại.")
                else 
                    req.flash("success", "Đổi mật khẩu thành công. Vui lòng đăng nhập lại."); 
            })
            .catch(error => {
                req.flash("error", "Đổi mật khẩu thất bại.")
            });
        }
            
        let options = {
            currentPassword: currentPassword, 
            newPassword: newPassword, 
            confirmPassword: confirmPassword,
            isNewUser: isNewUser, 
            error: req.flash("error"),
            success: req.flash("success")
        };
    
        res.json(options)
    })
}

module.exports = {
    getAccountManagementPage,
    addAccount,
    getProfilePage,
    getProfileByEmail,
    changeProfilePicture,
    findAccount,
    changePassword,
    initData,
    lockUser,
    resendEmail,
    changePwdNoPassOld,
    getChangePwdLogPage
};