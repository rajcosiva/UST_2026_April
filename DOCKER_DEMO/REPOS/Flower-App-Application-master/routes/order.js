const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Product = require('../models/product');


// Assuming you have some user authentication middleware
const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/auth/login');
};


router.post('/order', ensureAuthenticated, async (req, res) => {
    try {
        console.log('Request Body:', req.body);
        const { products, totalPrice } = req.body;
        const userId = req.user._id;

        // Log parsed products and totalPrice
        console.log('Parsed Products:', JSON.parse(products));
        console.log('Total Price:', totalPrice);

        const newOrder = new Order({
            userId,
            products: JSON.parse(products),  // Ensure products is parsed from JSON
            totalPrice
        });

        await newOrder.save();
        res.redirect('/thankyou');
    } catch (error) {
        console.error('Error creating order:', error.message);
        res.status(500).send('Server Error');
    }
});
module.exports = router;
