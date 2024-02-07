let Order = require("../models/order");
let Customer = require("../models/customer");

async function getOrderHistory(req, res) {
    const ITEMS_PER_PAGE = 10; // Số lượng item mỗi trang
    const page = parseInt(req.query.page) || 1; // Lấy số trang hiện tại
    const nextPage = page + 1;
    const prevPage = page - 1;
    const skip = (page - 1) * ITEMS_PER_PAGE;

    try {
        const orders = await getOrders();
        const totalOrders = orders.length;
        const totalPages = Math.ceil(totalOrders / ITEMS_PER_PAGE);
        const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

        const paginatedOrders = orders.slice(skip, skip + ITEMS_PER_PAGE);

        res.render('payment-history', { 
            orders: paginatedOrders, 
            success: req.flash("success"), error: req.flash("error"), 
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

async function getOrders() {
    try {
        let orders = await Order.find().lean();
        return orders;
    } catch (error) {
        throw new Error("Đã xảy ra lỗi khi lấy dữ liệu từ cơ sở dữ liệu.");
    }
}

async function getOrderHistoryByPhone(req, res) {
    let phone = req.params.customerPhone;

    const ITEMS_PER_PAGE = 10; // Số lượng item mỗi trang
    const page = parseInt(req.query.page) || 1; // Lấy số trang hiện tại
    const nextPage = page + 1;
    const prevPage = page - 1;
    const skip = (page - 1) * ITEMS_PER_PAGE;

    try {
        const orders = await Order.find({ customerPhone: phone }).lean();
        const totalOrders = orders.length;
        const totalPages = Math.ceil(totalOrders / ITEMS_PER_PAGE);
        const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

        const paginatedOrders = orders.slice(skip, skip + ITEMS_PER_PAGE);

        let options = {
            orders: paginatedOrders,
            success: req.flash("success"),
            error: req.flash("error"),
            email: req.session.email,
            currentPage: page,
            nextPage: nextPage,
            prevPage: prevPage,
            totalPages: totalPages,
            pages: pages,
        };

        res.render("payment-history", options);
    } catch (error) {
        console.error('Error fetching order history by phone:', error);
        res.status(500).send('Internal Server Error');
    }
}

// Khởi tạo 1 số dữ liệu mẫu để chạy chương trình
async function initData() {
    // Trước khi khởi tạo dữ liệu mẫu thì ta cần xóa các dữ liệu hiện có
    await Order.deleteMany()

    let order = new Order({
        orderId: "101220230940410909000000",
        customerPhone: "0909000000",
        totalPrice: 46580000,
        priceGivenByCustomer: 50000000,
        excessPrice: 3420000,
        dateOfPurchase: "10/12/2023",
        totalAmount: 2,
    });

    await order.save()

    let order2 = new Order({
        orderId: "091220230941030909000000",
        customerPhone: "0909000000",
        totalPrice: 25590000,
        priceGivenByCustomer: 26000000,
        excessPrice: 410000,
        dateOfPurchase: "09/12/2023",
        totalAmount: 1,
    });

    await order2.save()

    let order3 = new Order({
        orderId: "021220230941200909111111",
        customerPhone: "0909111111",
        totalPrice: 315000,
        priceGivenByCustomer: 320000,
        excessPrice: 5000,
        dateOfPurchase: "02/12/2023",
        totalAmount: 1,
    });

    await order3.save()

    let order4 = new Order({
        orderId: "041220230942120909222222",
        customerPhone: "0909222222",
        totalPrice: 22000000,
        priceGivenByCustomer: 23000000,
        excessPrice: 1000000,
        dateOfPurchase: "04/12/2023",
        totalAmount: 1,
    });

    await order4.save()

    let order5 = new Order({
        orderId: "251120230942340909111111",
        customerPhone: "0909111111",
        totalPrice: 621000,
        priceGivenByCustomer: 621000,
        excessPrice: 0,
        dateOfPurchase: "25/11/2023",
        totalAmount: 1,
    });

    await order5.save()
}

async function addOrder(req, res) {
    let currentDate = new Date();
    let phone = req.body.phone;
    let formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()}`;
    let formattedOrderId = `${currentDate.getDate().toString().padStart(2, '0')}${(currentDate.getMonth() + 1).toString().padStart(2, '0')}${currentDate.getFullYear()}${(currentDate.getHours()).toString().padStart(2, '0')}${(currentDate.getMinutes()).toString().padStart(2, '0')}${(currentDate.getSeconds()).toString().padStart(2, '0')}${phone}`;

    if (req.body.phone === "" || req.body.fullname === "Không tìm thấy khách hàng" || req.body.address === "Không tìm thấy khách hàng" || req.body.fullname === "" || req.body.address === "") {
        req.flash("error", "Thông tin khách hàng không hợp lệ");
        return res.render("product-payment", { error: req.flash("error") });
    }

    let order = new Order({
        orderId: formattedOrderId,
        customerPhone: req.body.phone,
        totalPrice: req.body.totalAmountInput,
        priceGivenByCustomer: 0,
        excessPrice: 0,
        dateOfPurchase: formattedDate,
        totalAmount: req.body.totalQuantityInput
    });

    order.save()
        .then(newOrder => {
            res.redirect("invoice");
        })
        .catch(error => {
            req.flash("error", "Có lỗi khi tạo hóa đơn");
            res.render("product-payment", { error: req.flash("error") });
        });
}

// Cập nhật lại priceGivenByCustomer và excessPrice
async function updateOrder(req, res) {
    let orderId = req.body.orderId;
    let priceGivenByCustomer = req.body.priceGivenByCustomer;
    let excessPrice = req.body.excessPrice;

    let order = await Order.findOne({ orderId: orderId });
    if (order === null)
        return res.json({ code: 1, error: "Hóa đơn không tồn tại" });

    order.priceGivenByCustomer = priceGivenByCustomer;
    order.excessPrice = excessPrice;
    await order.save();

    res.json({ code: 0, success: "In hóa đơn bán hàng thành công!" });
}

async function getReportAndAnalyticPage(req, res) {
    let email = req.session.email;

    if(email === "admin@gmail.com")
        res.render('report-analytic', { layout: "admin" });
    else
        res.render('report-analytic', { email });
}

async function reportAndAnalytic(req, res) {
    let generalTimeline = req.body.generalTimeline;
    let fromTimeLine = req.body.fromTimeLine;
    let toTimeLine = req.body.toTimeLine;
    let orders;

    // mặc định -> lấy hết
    if (!generalTimeline && !fromTimeLine && !toTimeLine) {
        orders = await Order.find().lean();
        return res.json({ code: 0, orders: orders });
    }

    // trường hợp mốc thời gian
    if (generalTimeline) {
        orders = await Order.find({ dateOfPurchase: generalTimeline }).lean();
        return res.json({ code: 0, orders: orders });
    }

    // trường hợp from - to
    orders = await Order.find({
        dateOfPurchase: {
            $gte: fromTimeLine,
            $lte: toTimeLine
        }
    })
    .lean();

    res.json({ code: 0, orders: orders });
}

module.exports = {
    getOrderHistory,
    getOrderHistoryByPhone,
    initData,
    addOrder,
    updateOrder,
    getReportAndAnalyticPage,
    reportAndAnalytic
};