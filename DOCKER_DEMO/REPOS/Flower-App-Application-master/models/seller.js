const mongoose = require('mongoose');


const SellerSchema = new mongoose.Schema({
    name: String,
    age: Number,
    gender: String,
    phone: String,
    email: String,
    residentialAddress: String,
    farmAddress: String,
    bankAccount: String,
    ifscCode: String,
    flowerTypes: String
});

module.exports = mongoose.model('Seller', SellerSchema);
