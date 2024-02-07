let mongoose = require("mongoose");

mongoose.Promise = global.Promise; // làm cho promise của mongo sẽ giống với promise của nodejs
let Schema = mongoose.Schema;

// Khai báo các thuộc tính cho model
let orderDetailSchema = new Schema({
    orderId: {
        type: String, // ddmmyyymmhhss
        unique: true, // Đảm bảo rằng giá trị orderId là duy nhất
        index: true,  // Tạo một index trên trường orderId để tối ưu tìm kiếm
    },
    barcode: String, 
    productName: String,
    price: Number, // đơn giá trên 1 sản phẩm
    amount: Number,
    totalPrice: Number // price * amount
});

let OrderDetail = mongoose.model("OrderDetail", orderDetailSchema);
module.exports = OrderDetail