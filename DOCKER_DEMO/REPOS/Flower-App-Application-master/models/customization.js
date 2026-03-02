const mongoose = require('mongoose');

const CustomizationSchema = new mongoose.Schema({
    flowerTypes: [String],
    message: String,
    wrapColor: String,
    totalPrice: Number
});

module.exports = mongoose.model('Customization', CustomizationSchema);