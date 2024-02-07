let OrderDetail = require("../models/orderdetail");

async function getOrderDetail(req, res) {
    const ITEMS_PER_PAGE = 10; // Số lượng item mỗi trang
    const page = parseInt(req.query.page) || 1; // Lấy số trang hiện tại
    const nextPage = page + 1;
    const prevPage = page - 1;
    const skip = (page - 1) * ITEMS_PER_PAGE;

    try {
        const orderdetails = await getOrderDetails();

        const totalOrderDetails = orderdetails.length;
        const totalPages = Math.ceil(totalOrderDetails / ITEMS_PER_PAGE);
        const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

        const paginatedOrderDetails = orderdetails.slice(skip, skip + ITEMS_PER_PAGE);

        res.render('detail-order', { 
            orderdetails: paginatedOrderDetails, 
            success: req.flash("success"), 
            error: req.flash("error"), 
            email: req.session.email,
            currentPage: page,
            nextPage: nextPage,
            prevPage: prevPage,
            totalPages: totalPages,
            pages: pages,
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Internal Server Error');
    }
}

async function getOrderDetails() {
    try {
        let orderdetails = await OrderDetail.find().lean();
        return orderdetails;
    } catch (error) {
        throw new Error("Đã xảy ra lỗi khi lấy dữ liệu từ cơ sở dữ liệu.");
    }
}

async function getOrderDetailById(req, res) {
    let orderId = req.params.orderId;

    const ITEMS_PER_PAGE = 10; // Số lượng item mỗi trang
    const page = parseInt(req.query.page) || 1; // Lấy số trang hiện tại
    const nextPage = page + 1;
    const prevPage = page - 1;
    const skip = (page - 1) * ITEMS_PER_PAGE;

    try {
        const orderDetails = await OrderDetail.find({ orderId: { $regex: `^${orderId.slice(0, -3)}` } }).lean();
        let email = req.session.email;

        const totalOrderDetails = orderDetails.length;
        const totalPages = Math.ceil(totalOrderDetails / ITEMS_PER_PAGE);
        const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

        const paginatedOrderDetails = orderDetails.slice(skip, skip + ITEMS_PER_PAGE);

        if(email === "admin@gmail.com")
            res.render("detail-order", {
                layout: "admin", 
                orderDetails: paginatedOrderDetails, 
                success: req.flash("success"), 
                error: req.flash("error"),
                currentPage: page,
                nextPage: nextPage,
                prevPage: prevPage,
                totalPages: totalPages,
                pages: pages,
            });
        else
            res.render("detail-order", {
                email: email, 
                orderDetails: paginatedOrderDetails, 
                success: req.flash("success"), 
                error: req.flash("error"),
                currentPage: page,
                nextPage: nextPage,
                prevPage: prevPage,
                totalPages: totalPages,
                pages: pages,
            });
            
    } catch (error) {
        console.error('Error fetching order details by order id:', error);
        res.status(500).send('Internal Server Error');
    }
}

// Khởi tạo 1 số dữ liệu mẫu để chạy chương trình
async function initData() {
    // Trước khi khởi tạo dữ liệu mẫu thì ta cần xóa các dữ liệu hiện có
    await OrderDetail.deleteMany()

    let orderdetail3 = new OrderDetail({
        orderId: "101220230940410909000000001",
        barcode: "00000000",
        productName: "Iphone 15 Pro Max 256Gb",
        price: 40990000,
        amount: 1,
        totalPrice: 40990000,
    });

    await orderdetail3.save()

    let orderdetail4 = new OrderDetail({
        orderId: "101220230940410909000000002",
        barcode: "00112233",
        productName: "Xiaomi Redmi Note 12 4G",
        price: 5590000,
        amount: 1,
        totalPrice: 5590000,
    });

    await orderdetail4.save()

    let orderdetail5 = new OrderDetail({
        orderId: "091220230941030909000000001",
        barcode: "11111111",
        productName: "Ipad Air 7",
        price: 25590000,
        amount: 1,
        totalPrice: 25590000,
    });

    await orderdetail5.save()

    let orderdetail6 = new OrderDetail({
        orderId: "021220230941200909111111001",
        barcode: "55556666",
        productName: "Ốp lưng MagSafe iPhone 14",
        price: 315000,
        amount: 1,
        totalPrice: 315000,
    });

    await orderdetail6.save()

    let orderdetail7 = new OrderDetail({
        orderId: "041220230942120909222222001",
        barcode: "11223344",
        productName: "Iphone 15 Plus 256Gb",
        price: 22000000,
        amount: 1,
        totalPrice: 22000000,
    });

    await orderdetail7.save()

    let orderdetail8 = new OrderDetail({
        orderId: "251120230942340909111111001",
        barcode: "77778888",
        productName: "Ốp lưng Magsafe iPhone 15",
        price: 621000,
        amount: 1,
        totalPrice: 621000,
    });

    await orderdetail8.save()
}

module.exports = {
    getOrderDetailById,
    getOrderDetail,
    initData
};