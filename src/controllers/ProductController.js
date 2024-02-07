let Product = require("../models/product");
let Customer = require("../models/customer");
let Order = require("../models/order");
let OrderDetail = require("../models/orderdetail");
let multiparty = require('multiparty') // upload file
let fsx = require('fs-extra'); // upload file
const path = require('path');

async function getProductManagementPage(req, res) {
    const ITEMS_PER_PAGE = 10; // Số lượng item mỗi trang
    const page = parseInt(req.query.page) || 1; // Lấy số trang hiện tại
    const nextPage = page + 1;
    const prevPage = page - 1;
    const skip = (page - 1) * ITEMS_PER_PAGE;

    try {
        let products = await getProducts();
        const totalProducts = products.length;
        const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
        const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

        const paginatedProducts = products.slice(skip, skip + ITEMS_PER_PAGE);

        res.render('product-management', { 
            layout: "admin", 
            products: paginatedProducts, 
            success: req.flash("success"), 
            error: req.flash("error"),
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

async function getHomePage(req, res) {
    const ITEMS_PER_PAGE = 12; // Số lượng item mỗi trang
    const page = parseInt(req.query.page) || 1; // Lấy số trang hiện tại
    const nextPage = page + 1;
    const prevPage = page - 1;
    const skip = (page - 1) * ITEMS_PER_PAGE;

    try {
        const products = await getProducts();
        const totalProducts = products.length;
        const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
        const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

        const paginatedProducts = products.slice(skip, skip + ITEMS_PER_PAGE);

        res.render('index', {
            products: paginatedProducts,
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

// Khởi tạo 1 số dữ liệu mẫu để chạy chương trình
async function initData() {
    // Trước khi khởi tạo dữ liệu mẫu thì ta cần xóa các dữ liệu hiện có
    await Product.deleteMany()

    let product = new Product({
        barcode: "00000000", 
        productName: "Iphone 15 Pro Max 256Gb",
        importPrice: 35000000,
        retailPrice: 40990000,
        category: "Điện thoại",
        creationDate: "03/08/2022",
        image: "iphone15.png"
    });

    await product.save()

    let product2 = new Product({
        barcode: "11111111", 
        productName: "Ipad Air 7",
        importPrice: 20380000,
        retailPrice: 25590000,
        category: "Máy tính bảng",
        creationDate: "15/12/2022",
        image: "ipadair7.png"
    });

    await product2.save()

    let product3 = new Product({
        barcode: "22222222", 
        productName: "Iphone 14 Pro 128Gb",
        importPrice: 28500000,
        retailPrice: 33570000,
        category: "Điện thoại",
        creationDate: "15/12/2022",
        image: "iphone14.png"
    });

    await product3.save()

    let product4 = new Product({
        barcode: "33333333", 
        productName: "Galaxy Z Fold4 5G 128Gb",
        importPrice: 25000000,
        retailPrice: 27990000,
        category: "Điện thoại",
        creationDate: "15/12/2022",
        image: "galaxyzfold.jpg"
    });

    await product4.save()

    let product5 = new Product({
        barcode: "44444444", 
        productName: "Galaxy Z Flip4 5G 256Gb",
        importPrice: 20000000,
        retailPrice: 22000000,
        category: "Điện thoại",
        creationDate: "15/12/2022",
        image: "galaxyzflip.jpg"
    });

    await product5.save()

    let product6 = new Product({
        barcode: "55555555", 
        productName: "Xiaomi 13T 5G 8Gb",
        importPrice: 8000000,
        retailPrice: 9560000,
        category: "Điện thoại",
        creationDate: "16/12/2022",
        image: "xiaomi.jpg"
    });

    await product6.save()

    let product7 = new Product({
        barcode: "66666666", 
        productName: "Oppo A58 8Gb",
        importPrice: 5000000,
        retailPrice: 5490000,
        category: "Điện thoại",
        creationDate: "16/12/2022",
        image: "oppoa58.jpg"
    });

    await product7.save()

    let product8 = new Product({
        barcode: "77777777", 
        productName: "Oppo Find N3 5G",
        importPrice: 40000000,
        retailPrice: 44990000,
        category: "Điện thoại",
        creationDate: "16/12/2022",
        image: "oppofind.jpg"
    });

    await product8.save()

    let product9 = new Product({
        barcode: "88888888", 
        productName: "Samsung Galaxy S23 5G 128Gb",
        importPrice: 13000000,
        retailPrice: 16890000,
        category: "Điện thoại",
        creationDate: "16/12/2022",
        image: "s235g.jpg"
    });

    await product9.save()

    let product10 = new Product({
        barcode: "99999999", 
        productName: "Realme C53",
        importPrice: 2000000,
        retailPrice: 3800000,
        category: "Điện thoại",
        creationDate: "16/12/2022",
        image: "realmec53.jpg"
    });

    await product10.save()

    let product11 = new Product({
        barcode: "00112233", 
        productName: "Xiaomi Redmi Note 12 4G",
        importPrice: 5000000,
        retailPrice: 5590000,
        category: "Điện thoại",
        creationDate: "17/12/2022",
        image: "redmi.jpg"
    });

    await product11.save()

    
    let product12 = new Product({
        barcode: "11223344", 
        productName: "Iphone 15 Plus 256Gb",
        importPrice: 15000000,
        retailPrice: 22000000,
        category: "Điện thoại",
        creationDate: "17/12/2022",
        image: "15plus.jpg"
    });

    await product12.save()

    let product13 = new Product({
        barcode: "22334455", 
        productName: "Iphone 13 128Gb",
        importPrice: 14500000,
        retailPrice: 16490000,
        category: "Điện thoại",
        creationDate: "17/12/2022",
        image: "iphone13.jpg"
    });

    await product13.save()

    let product14 = new Product({
        barcode: "33445566", 
        productName: "Galaxy Tab A8",
        importPrice: 4650000,
        retailPrice: 5790000,
        category: "Điện thoại",
        creationDate: "18/12/2022",
        image: "taba8.jpg"
    });

    await product14.save()

    let product15 = new Product({
        barcode: "44556677", 
        productName: "Oppo Pad Air 64Gb",
        importPrice: 4500000,
        retailPrice: 5890000,
        category: "Điện thoại",
        creationDate: "18/12/2022",
        image: "padair.jpg"
    });

    await product15.save()

    let product16 = new Product({
        barcode: "55667788", 
        productName: "Vivo v29e 5G",
        importPrice: 7455000,
        retailPrice: 9490000,
        category: "Điện thoại",
        creationDate: "18/12/2022",
        image: "v29e.jpg"
    });

    await product16.save()

    let product33 = new Product({
        barcode: "23456789", 
        productName: "Lenovo Tab M8 (Gen 4)",
        importPrice: 2000000,
        retailPrice: 2990000,
        category: "Điện thoại",
        creationDate: "19/12/2022",
        image: "lenovo.jpg"
    });

    await product33.save()

    let product34 = new Product({
        barcode: "34567890", 
        productName: "Samsung Galaxy Tab S9+ 5G",
        importPrice: 22000000,
        retailPrice: 23890000,
        category: "Điện thoại",
        creationDate: "19/12/2022",
        image: "galaxytab.jpg"
    });

    await product34.save()

    let product35 = new Product({
        barcode: "45678901", 
        productName: "Xiaomi Redmi Pad SE 6GB",
        importPrice: 3800000,
        retailPrice: 4990000,
        category: "Điện thoại",
        creationDate: "19/12/2022",
        image: "galaxytab.jpg"
    });

    await product35.save()

    let product36 = new Product({
        barcode: "56789012", 
        productName: "iPad Air 5 M1 WiFi 64GB",
        importPrice: 13500000,
        retailPrice: 14590000,
        category: "Điện thoại",
        creationDate: "19/12/2022",
        image: "m1.jpg"
    });

    await product36.save()

    let product17 = new Product({
        barcode: "66778899", 
        productName: "Mazer 20W MagAir16",
        importPrice: 1000000,
        retailPrice: 1520000,
        category: "Phụ kiện",
        creationDate: "19/12/2022",
        image: "mazer.jpg"
    });

    await product17.save()

    let product18 = new Product({
        barcode: "77889900", 
        productName: "Baseus 220V/450W ioTa BPE45A",
        importPrice: 6000000,
        retailPrice: 6590000,
        category: "Phụ kiện",
        creationDate: "19/12/2022",
        image: "baseus.jpg"
    });

    await product18.save()

    let product19 = new Product({
        barcode: "88990011", 
        productName: "Xmobile 20W Y73",
        importPrice: 400000,
        retailPrice: 560000,
        category: "Phụ kiện",
        creationDate: "19/12/2022",
        image: "xmobile.jpg"
    });

    await product19.save()

    let product20 = new Product({
        barcode: "99001122", 
        productName: "LAUT Handy 20W E33A",
        importPrice: 600000,
        retailPrice: 765000,
        category: "Phụ kiện",
        creationDate: "20/12/2022",
        image: "laut.jpg"
    });

    await product20.save()

    let product21 = new Product({
        barcode: "00001111", 
        productName: "Sạc Samsung EP-T2510N",
        importPrice: 300000,
        retailPrice: 495000,
        category: "Phụ kiện",
        creationDate: "21/12/2022",
        image: "sacsamsung.jpg"
    });

    await product21.save()

    let product22 = new Product({
        barcode: "11112222", 
        productName: "Sạc Xmobile DS636",
        importPrice: 700000,
        retailPrice: 880000,
        category: "Phụ kiện",
        creationDate: "21/12/2022",
        image: "sacxmobile.jpg"
    });

    await product22.save()

    let product23 = new Product({
        barcode: "22223333", 
        productName: "Cáp Lightning 1m Xmobile L2205",
        importPrice: 80000,
        retailPrice: 195000,
        category: "Phụ kiện",
        creationDate: "22/12/2022",
        image: "lightning.jpg"
    });

    await product23.save()

    let product24 = new Product({
        barcode: "33334444", 
        productName: "Cáp Type C 2m AVA+ DS08C",
        importPrice: 50000,
        retailPrice: 120000,
        category: "Phụ kiện",
        creationDate: "22/12/2022",
        image: "typec.jpg"
    });

    await product24.save()

    let product25 = new Product({
        barcode: "44445555", 
        productName: "Ốp lưng Galaxy A05 Silicone JM Candy",
        importPrice: 50000,
        retailPrice: 100000,
        category: "Phụ kiện",
        creationDate: "22/12/2022",
        image: "opa05.jpg"
    });

    await product25.save()

    let product26 = new Product({
        barcode: "55556666", 
        productName: "Ốp lưng MagSafe iPhone 14",
        importPrice: 250000,
        retailPrice: 315000,
        category: "Phụ kiện",
        creationDate: "22/12/2022",
        image: "opiphone14.jpg"
    });

    await product26.save()

    let product27 = new Product({
        barcode: "66667777", 
        productName: "Ốp lưng Magsafe Galaxy Z Fold5",
        importPrice: 650000,
        retailPrice: 750000,
        category: "Phụ kiện",
        creationDate: "22/12/2022",
        image: "opgalaxy.jpg"
    });

    await product27.save()

    let product28 = new Product({
        barcode: "77778888", 
        productName: "Ốp lưng Magsafe iPhone 15",
        importPrice: 550000,
        retailPrice: 621000,
        category: "Phụ kiện",
        creationDate: "22/12/2022",
        image: "opiphone15.jpg"
    });

    await product28.save()

    let product29 = new Product({
        barcode: "88889999", 
        productName: "Tai nghe Có Dây Mozard DS510-WB",
        importPrice: 70000,
        retailPrice: 135000,
        category: "Phụ kiện",
        creationDate: "23/12/2022",
        image: "mozard.jpg"
    });

    await product29.save()

    let product30 = new Product({
        barcode: "99990000", 
        productName: "Tai nghe Có Dây JBL C200 SIU",
        importPrice: 150000,
        retailPrice: 290000,
        category: "Phụ kiện",
        creationDate: "22/12/2022",
        image: "jbl.jpg"
    });

    await product30.save()

    let product31 = new Product({
        barcode: "01234567", 
        productName: "Tai nghe Bluetooth AirPods Gen 2",
        importPrice: 4500000,
        retailPrice: 5990000,
        category: "Phụ kiện",
        creationDate: "23/12/2022",
        image: "airpod.jpg"
    });

    await product31.save()

    let product32 = new Product({
        barcode: "12345678", 
        productName: "Tai nghe Soundpeats Engine4",
        importPrice: 700000,
        retailPrice: 980000,
        category: "Phụ kiện",
        creationDate: "23/12/2022",
        image: "engine4.jpg"
    });

    await product32.save()
}

async function addProduct(req, res) {
    let form = new multiparty.Form();

    form.parse(req, async (error, data, files) => {
        if (error) {
            console.log("Error File upload: " + error);
            const products = await Product.find().lean();
            req.flash("error", "Đã xảy ra lỗi khi xử lý upload file");
            return res.render("product-management", { error : req.flash("error"), products });
        }

        if (data.barcode[0] === '' || data.productName[0] === '' || data.importPrice[0] <= 0 || data.retailPrice[0] <= 0 || data.category[0] === '' || data.creationDate[0] === '' || files.image[0].originalFilename === '') {
            const products = await Product.find().lean();
            req.flash("error", "Vui lòng nhập đầy đủ thông tin và chọn file ảnh.");
            return res.render("product-management", { error : req.flash("error"), products });
        }

        try {
            let file = files.image[0];
            let tempPath = file.path;
            let savePath = path.join(__dirname, "../public/uploads/products", file.originalFilename);

            await fsx.copy(tempPath, savePath);

            let formattedDate = formatDate(data.creationDate[0]);

            let product = new Product({
                barcode: data.barcode[0],
                productName: data.productName[0],
                importPrice: data.importPrice - 0, // Conversion to float
                retailPrice: data.retailPrice - 0, // Conversion to float
                category: data.category[0],
                creationDate: formattedDate,
                image: file.originalFilename
            });

            product.save()
                .then(newProduct => {
                    req.flash("success", "Thêm sản phẩm thành công.");
                    return res.redirect("/product-management");
                })
                .catch(error => {
                    req.flash("error", "Sản phẩm này đã tồn tại hoặc có lỗi khi lưu.");
                    res.redirect("/product-management");
                });
        } catch (error) {
            req.flash("error", "Đã xảy ra lỗi khi xử lý thêm sản phẩm.");
            return res.redirect("/product-management");
        }
    });
}

async function editProduct(req, res) {
    let form = new multiparty.Form();

    form.parse(req, async (error, data, files) => {
        if (error) {
            console.log("Error File upload: " + error);
            const products = await Product.find().lean();
            req.flash("error", "Đã xảy ra lỗi khi xử lý upload file");
            return res.render("product-management", { error: req.flash("error"), products });
        }

        if (data.barcode[0] === '' || data.productName[0] === '' || data.importPrice[0] <= 0 || data.retailPrice[0] <= 0 || data.category[0] === '' || data.creationDate[0] === '') {
            req.flash("error", "Vui lòng nhập đầy đủ thông tin.");
            return res.redirect("/product-management");
        }

        try {
            const barcode = data.barcode[0]; 

            let product = await Product.findOne({ barcode }).exec();

            if (!product) {
                req.flash("error", "Không tìm thấy sản phẩm để chỉnh sửa.");
                return res.redirect("/product-management");
            }

            product.productName = data.productName[0];
            product.importPrice = data.importPrice[0] - 0;
            product.retailPrice = data.retailPrice[0] - 0;
            product.category = data.category[0];
            product.creationDate = formatDate(data.creationDate[0]);

            let file = files.image[0];
            if (file.originalFilename !== "") {
                let tempPath = file.path;
                let savePath = path.join(__dirname, "../public/uploads/products", file.originalFilename);

                await fsx.copy(tempPath, savePath);
                product.image = file.originalFilename;
            }

            await product.save();

            req.flash("success", "Chỉnh sửa sản phẩm thành công.");
            return res.render("product-management", { product });
        } catch (error) {
            req.flash("error", "Đã xảy ra lỗi khi chỉnh sửa sản phẩm.");
            return res.redirect("/product-management");
        }
    });
}

async function deleteProduct(req, res) {
    try {
        let barcode = req.body.barcode;
        let products;

        // Kiểm tra xem sản phẩm có từng được mua rồi hay không
        let orderDetail = await OrderDetail.findOne({barcode: barcode});

        if (orderDetail) {
            products = await Product.find().lean();

            req.flash("error", "Không thể xóa sản phẩm này vì đã được mua trước đó.");
            return res.render('product-management', { error: req.flash('error'), products });
        }
        
        let deletedProduct = await Product.findOneAndDelete({ barcode });

        if (deletedProduct) {
            products = await Product.find().lean();

            req.flash("success", "Xóa sản phẩm thành công.");
            res.render('product-management', { success: req.flash('success'), products });
        } else {
            req.flash("error", "Không thể xóa sản phẩm. Sản phẩm không tồn tại.");
            res.redirect('/product-management');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        req.flash("error", "Lỗi trong quá trình xóa sản phẩm.");
        res.redirect('/product-management');
    }
}

function formatDate(inputDate) {
    const parts = inputDate.split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

async function getProducts() {
    try {
        let products = await Product.find().lean();
        return products;
    } catch (error) {
        throw new Error("Đã xảy ra lỗi khi lấy dữ liệu từ cơ sở dữ liệu.");
    }
}

async function searchProduct(req, res) {
    try {
        const keyword = req.body.keyword;
        let results;

        if (!keyword || keyword.trim() === '') {
            return res.json([]);
        } else {
            // Tìm kiếm theo cả barcode và tên sản phẩm
            results = await Product.find({
                $or: [
                    { barcode: { $regex: keyword, $options: 'i' } },
                    { productName: { $regex: keyword, $options: 'i' } }
                ]
            }).lean();
        }
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: "Đã xảy ra lỗi khi tìm kiếm sản phẩm." });
    }
}

async function handlePayment(req, res) {
    try {
        const currentDate = new Date();
        const phone = req.body.phone;
        const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()}`;
        const formattedOrderId = `${currentDate.getDate().toString().padStart(2, '0')}${(currentDate.getMonth() + 1).toString().padStart(2, '0')}${currentDate.getFullYear()}${(currentDate.getHours()).toString().padStart(2, '0')}${(currentDate.getMinutes()).toString().padStart(2, '0')}${(currentDate.getSeconds()).toString().padStart(2, '0')}${phone}`;

        if (req.body.phone === "" || req.body.fullname === "Không tìm thấy khách hàng" || req.body.address === "Không tìm thấy khách hàng" || req.body.fullname === "" || req.body.address === "") {
            req.flash("error", "Thông tin khách hàng không hợp lệ");
            return res.render("product-payment", { error: req.flash("error") });
        }

        const existingCustomer = await Customer.findOne({ phone: req.body.phone });

        if (existingCustomer) {
            existingCustomer.fullname = req.body.fullname;
            existingCustomer.address = req.body.address;
            await existingCustomer.save();
        } else {
            const newCustomer = new Customer({
                phone: req.body.phone,
                fullname: req.body.fullname,
                address: req.body.address
            });
            await newCustomer.save();
        }

        const order = new Order({
            orderId: formattedOrderId,
            customerPhone: req.body.phone,
            totalPrice: req.body.totalAmountInput,
            priceGivenByCustomer: 0,
            excessPrice: 0,
            dateOfPurchase: formattedDate,
            totalAmount: req.body.totalQuantityInput
        });
        await order.save();

        const productTable = await req.body.productTable;
        const parsedProductTable = JSON.parse(productTable);

        if (parsedProductTable.length === 0) {
            req.flash("error", "Chưa có sản phẩm trong giỏ hàng");
            return res.render("product-payment", { error: req.flash("error") });
        }

        let orderDetails = [];
        let counter = 1;

        for (const product of parsedProductTable) {
            let uniqueFormattedOrderId = `${formattedOrderId}${counter.toString().padStart(3, '0')}`;
            let totalPrice = product.total;

            const orderDetail = new OrderDetail({
                orderId: uniqueFormattedOrderId,
                barcode: product.barcode,
                productName: product.productName,
                price: product.retailPrice,
                amount: product.quantity,
                totalPrice: product.total
            });
            orderDetails.push(orderDetail);
            counter++;
        }

        await OrderDetail.insertMany(orderDetails);
        res.redirect(`invoice/${formattedOrderId}/${req.body.totalAmountInput}`);
    } catch (error) {
        req.flash("error", "Không thể thanh toán hóa đơn");
        res.render("product-payment", { error: req.flash("error") });
    }
}

module.exports = {
    getProductManagementPage,
    getHomePage,
    initData,
    addProduct,
    editProduct,
    deleteProduct,
    searchProduct,
    handlePayment
};