let mongoose = require("mongoose");

mongoose.Promise = global.Promise; // làm cho promise của mongo sẽ giống với promise của nodejs
let Schema = mongoose.Schema;

// Khai báo các thuộc tính cho model
let customerSchema = new Schema({
    phone: {
        type: String,
        unique: true, // Đảm bảo rằng giá trị phone là duy nhất
        index: true,  // Tạo một index trên trường phone để tối ưu tìm kiếm
    },
    fullname: String,
    address: String
});

let Customer = mongoose.model("Customer", customerSchema);
module.exports = Customer