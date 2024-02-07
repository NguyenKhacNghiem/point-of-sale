let mongoose = require("mongoose");

mongoose.Promise = global.Promise; // làm cho promise của mongo sẽ giống với promise của nodejs
let Schema = mongoose.Schema;

// Khai báo các thuộc tính cho model
let orderSchema = new Schema({
    orderId: {
        type: String, // ddmmyyymmhhss
        unique: true, // Đảm bảo rằng giá trị orderId là duy nhất
        index: true,  // Tạo một index trên trường orderId để tối ưu tìm kiếm
    },
    customerPhone: String,
    totalPrice: Number, // tổng của các totalPrice của orderDetail
    priceGivenByCustomer: Number, 
    excessPrice: Number, 
    dateOfPurchase: String,
    totalAmount: Number  // tổng các amount của orderDetail

});

let Order = mongoose.model("Order", orderSchema);
module.exports = Order