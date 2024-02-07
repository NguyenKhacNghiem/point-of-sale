let mongoose = require("mongoose");

mongoose.Promise = global.Promise; // làm cho promise của mongo sẽ giống với promise của nodejs
let Schema = mongoose.Schema;

// Khai báo các thuộc tính cho model
let accountSchema = new Schema({
    email: {
        type: String,
        unique: true, // Đảm bảo rằng giá trị email là duy nhất
        index: true,  // Tạo một index trên trường email để tối ưu tìm kiếm
    },
    password: String,
    fullname: String,
    profilePicture: String,
    activateStatus: Number, // 0 || 1
    isNewUser: Number, // 0 || 1
    lockedStatus: Number // 0 || 1
});

let Account = mongoose.model("Account", accountSchema);
module.exports = Account