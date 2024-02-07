let Customer = require("../models/customer");

async function addCustomer(req, res) {
    if(req.body.phone === "" || req.body.fullname === "Không tìm thấy khách hàng" || req.body.address === "Không tìm thấy khách hàng" || req.body.fullname === "" || req.body.address === "") {
        req.flash("error", "Thông tin khách hàng không hợp lệ");
        return res.render("product-payment", { error: req.flash("error") });
    }

    let customer = new Customer({
        phone: req.body.phone, 
        fullname: req.body.fullname,
        address: req.body.address
    });

    const existingCustomer = await Customer.findOne({ phone: req.body.phone });

    if (existingCustomer) {
        return res.redirect("invoice");
    }

    customer.save()
    .then(newCustomer => {
        res.redirect("invoice");
    })
    .catch(error => {
        req.flash("error", "Người dùng đã tồn tại");//tồn tại rồi thì in hóa đơn luôn
        res.render("product-payment", {error: req.flash("error"), email: req.body.email, fullname: req.body.fullname, address: req.body.address});
    });
}

function findCustomer(req, res) {
    let phone = req.params.phone;

    Customer.findOne({
        phone: phone
    })
    .then(customer => {
        if(!customer) 
            return res.json({ fullname: "Không tìm thấy khách hàng", address: "Không tìm thấy khách hàng" })
                
        res.json({ fullname: customer.fullname, address: customer.address })
    })
    .catch(error => {
        res.json({ fullname: "Lỗi không tìm thấy khách hàng", address: "Lỗi không tìm thấy khách hàng" })
    });
}

async function getStaffPaymentPage(req, res) {
    const ITEMS_PER_PAGE = 10; // Số lượng item mỗi trang
    const page = parseInt(req.query.page) || 1; // Lấy số trang hiện tại
    const nextPage = page + 1;
    const prevPage = page - 1;
    const skip = (page - 1) * ITEMS_PER_PAGE;

    try {
        const customers = await getCustomers();
        const totalCustomers = customers.length;
        const totalPages = Math.ceil(totalCustomers / ITEMS_PER_PAGE);
        const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

        const paginatedCustomers = customers.slice(skip, skip + ITEMS_PER_PAGE);

        res.render('staff-payment', { 
            customers: paginatedCustomers, 
            success: req.flash("success"), 
            error: req.flash("error"), 
            email: req.session.email,
            currentPage: page,
            nextPage: nextPage,
            prevPage: prevPage,
            totalPages: totalPages,
            pages: pages
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Internal Server Error');
    }
}

async function getCustomers() {
    try {
        let customers = await Customer.find().lean();
        return customers;
    } catch (error) {
        throw new Error("Đã xảy ra lỗi khi lấy dữ liệu từ cơ sở dữ liệu.");
    }
}

// Khởi tạo 1 số dữ liệu mẫu để chạy chương trình
async function initData() {
    // Trước khi khởi tạo dữ liệu mẫu thì ta cần xóa các dữ liệu hiện có
    await Customer.deleteMany()

    let customer = new Customer({
        phone: "0909000000", 
        fullname: "Nguyễn Văn A",
        address: "Cà Mau"
    });

    await customer.save()

    let customer2 = new Customer({
        phone: "0909111111", 
        fullname: "Nguyễn Văn B",
        address: "Yên Bái"
    });

    await customer2.save()

    let customer3 = new Customer({
        phone: "0909222222", 
        fullname: "Nguyễn Văn C",
        address: "Hà Nội"
    });

    await customer3.save()

    let customer4 = new Customer({
        phone: "0909333333", 
        fullname: "Nguyễn Văn D",
        address: "Hà Nội"
    });

    await customer4.save()

    let customer5 = new Customer({
        phone: "0909444444", 
        fullname: "Nguyễn Văn E",
        address: "Hà Nội"
    });

    await customer5.save()
}

module.exports = {
    addCustomer,
    findCustomer,
    getStaffPaymentPage,
    initData
};