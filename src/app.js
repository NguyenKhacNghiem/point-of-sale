// Import các package
const express = require('express')
const mongoose = require("mongoose"); // giúp tương tác database
require("dotenv").config(); // giúp tương tác file .env
const cookieParser = require('cookie-parser'); // cookie
const hbs = require('express-handlebars') 
const session = require('express-session'); // session
const flash = require('connect-flash'); // flash message
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Import các module controller
const accountController = require('./controllers/AccountController')
const productController = require('./controllers/ProductController')
const orderController = require('./controllers/OrderController')
const orderDetailController = require('./controllers/OrderDetailController')
const customerController = require('./controllers/CustomerController')

// Lấy dữ liệu từ file .env ra
const PORT = process.env.PORT;
const CONNECTION_STRING = process.env.CONNECTION_STRING;
const COOKIE_SIGN = process.env.COOKIE_SIGN;

// Cấu hình các package đã import
let app = express()
app.use(express.static(__dirname + '/public')) // truy cập thư mục public để sử dụng img, css, js,...
app.use(express.json());  // lấy dữ liệu từ request dưới dạng JSON
app.use(express.urlencoded({ extended: true })); // lấy dữ liệu từ request dưới dạng url-encoded
app.use(cookieParser(COOKIE_SIGN)); // cookie
app.use(session({ // session
    secret: COOKIE_SIGN,
    resave: true,
    saveUninitialized: true,
}));
app.use(flash()) // flash message
app.engine('handlebars', hbs.engine({
    defaultLayout: 'main',
    helpers: {
        getLockedStatus: (email, lockedStatus) => {
            if(lockedStatus - 0 === 1)
                return `
                <button class="btn btn-danger" onclick="lockUser('${email}')">
                    <i class="fa-solid fa-lock"></i>          
                </button>
            `;

            return `
                    <button class="btn btn-success" onclick="lockUser('${email}')">
                        <i class="fa-solid fa-lock-open"></i>          
                    </button>
                `;
        },
        
        eq: (value1, value2, options) => {
            return value1 === value2;
        },

        formatPrice: (price) => {
            return price.toLocaleString('vi-VN'); 
        },
        
        // Những account nào chưa activate tài khoản thông qua email sẽ có background màu vàng tại trang quản lý account
        isActivateAccount: (activateStatus) => {
            if(activateStatus === 0)
                return 'class="bg-warning"';
            else
                return "";
        }
    }                   
}))
app.set('view engine', 'handlebars')

// Điều hướng navigation
app.get("/", (req, res) => {
    if(!req.session.email || req.session.email === "admin@gmail.com")
        return res.redirect("/login");

    productController.getHomePage(req, res);
})

app.post('/search-product', (req, res) => {
    productController.searchProduct(req, res);
})

app.get("/product-payment", (req, res) => {
    if(!req.session.email || req.session.email === "admin@gmail.com")
        return res.redirect("/login");

    res.render('product-payment', {email: req.session.email});
})

app.get("/staff-payment", (req, res) => {
    if(!req.session.email || req.session.email === "admin@gmail.com")
        return res.redirect("/login");
        
    customerController.getStaffPaymentPage(req, res);
})

app.post("/product-payment", (req, res) => {
    productController.handlePayment(req, res);
})

app.get("/profile", (req, res) => {
    if(!req.session.email || req.session.email === "admin@gmail.com")
        return res.redirect("/login");

    accountController.getProfilePage(req, res);
})

app.get("/profileid/:email", (req, res) => {
    if(!req.session.email || req.session.email !== "admin@gmail.com")
        return res.redirect("/login");

    accountController.getProfileByEmail(req, res);
})

app.get("/change-password", (req, res) => {
    if(!req.session.email || req.session.email === "admin@gmail.com")
        return res.redirect("/login");

    res.render('changepassword', {email: req.session.email});
})

app.get("/admin-change-password", (req, res) => {
    if(!req.session.email || req.session.email !== "admin@gmail.com")
        return res.redirect("/login");

    res.render('changepassword', {layout: "admin"});
})

app.get("/changepwd_logout", (req, res) => {
    if(!req.session.email || req.session.email === "admin@gmail.com")
        return res.redirect("/login");

    accountController.getChangePwdLogPage(req, res);
})

app.get("/account-management", (req, res) => {
    if(!req.session.email || req.session.email !== "admin@gmail.com")
        return res.redirect("/login");

    accountController.getAccountManagementPage(req, res);
})

app.get("/product-management", (req, res) => {
    if(!req.session.email || req.session.email !== "admin@gmail.com")
        return res.redirect("/login");

    productController.getProductManagementPage(req, res);
})

app.post("/product-management", (req, res) => {
    productController.addProduct(req, res);
})

app.post("/edit-product", (req, res) => {
    productController.editProduct(req, res);
})

app.post("/delete-product", (req, res) => {
    productController.deleteProduct(req, res);
})

app.get("/login", (req, res) => {
    if (req.session.email) {
        delete req.session.email;
    }

    const token = req.query.token;
    const hashedEmail = req.query.hashedEmail;

    // Kiểm tra xem token và hashedEmail có được cung cấp hay không
    if (!token || !hashedEmail) {
        return res.render('login'); // Hiển thị trang đăng nhập mà không có dữ liệu liên quan đến token
    }

    // Xác thực token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                // Token đã hết hạn
                return res.render('timeout'); // Hiển thị trang thông báo hết thời gian
            } else {
                // Token không hợp lệ vì lý do khác
                return res.render('404');
            }
        }

        // Kiểm tra sự tương đồng giữa hash của email và hashedEmail từ đường link
        if (!bcrypt.compareSync(decoded.email, hashedEmail)) {
            return res.status(401).send('Xác thực không thành công');
        }

        // Token và xác thực thành công, tiếp tục xử lý đăng nhập
        res.render('login', { token, hashedEmail});
    });
});

app.get("/signup", (req, res) => {
    if (req.session.email) {
        delete req.session.email;
    }

    res.render('signup');
})

// app.get("/payment", (req, res) => {
//     res.render('payment');
// })

app.get("/invoice/:orderId/:totalPrice", (req, res) => {
    if(!req.session.email || req.session.email === "admin@gmail.com")
        return res.redirect("/login");

    let orderId = req.params.orderId;
    let totalPrice = req.params.totalPrice - 0;

    res.render('invoice', {layout: null, orderId: orderId, totalPrice: totalPrice});
})

app.post("/signup", (req, res) => {
    accountController.addAccount(req, res);
})

app.post("/profile", (req, res) => {
    accountController.changeProfilePicture(req, res);
})

app.post("/login", (req, res) => {
    accountController.findAccount(req, res);
})

app.put("/change-password", (req, res) => {
    accountController.changePassword(req, res);
})

app.put("/changepwd_logout", (req, res) => {
    accountController.changePwdNoPassOld(req, res);
})

app.put("/lock-user", (req, res) => {
    accountController.lockUser(req, res);
})

app.post("/resend-email", (req, res) => {
    accountController.resendEmail(req, res);
    res.end();
})

app.get("/customer/:phone", (req, res) => {
    if(!req.session.email || req.session.email === "admin@gmail.com")
        return res.redirect("/login");

    customerController.findCustomer(req, res);
})

app.get("/payment-history", (req, res) => {
    if(!req.session.email || req.session.email === "admin@gmail.com")
        return res.redirect("/login");

    orderController.getOrderHistory(req, res);
})

app.put("/payment-history", (req, res) => {
    orderController.updateOrder(req, res);
})

app.get("/payment-history/:customerPhone", (req, res) => {
    if(!req.session.email || req.session.email === "admin@gmail.com")
        return res.redirect("/login");

    orderController.getOrderHistoryByPhone(req, res);
})

// app.get("/detail-order", (req, res) => {
//     orderDetailController.getOrderDetail(req, res);
// })

app.get("/detail-order/:orderId", (req, res) => {
    if(!req.session.email)
        return res.redirect("/login");

    orderDetailController.getOrderDetailById(req, res);
})

app.get("/report-analytic", (req, res) => {
    if(!req.session.email)
        return res.redirect("/login");

    orderController.getReportAndAnalyticPage(req, res);
})

app.post("/report-analytic", (req, res) => {
    orderController.reportAndAnalytic(req, res);
})

// Middle ware 404 error
app.use((req, res) => {
    res.status(404) 
    res.render('404', {layout: null})
})

// Middle ware 500 error
app.use((err, req, res, next) => {
    console.error(err.message) 
    res.status(500)
    res.render('500', {layout: null})
})

// Kết nối tới database ()
mongoose.connect(CONNECTION_STRING, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})
.then(() => {
    accountController.initData();
    productController.initData();
    customerController.initData();
    orderController.initData();
    orderDetailController.initData();

    console.log('Database connected');

    app.listen(PORT); // Tạo server trên cổng 8080
})
.catch((error) => {
    console.log('Error connecting to database');
});