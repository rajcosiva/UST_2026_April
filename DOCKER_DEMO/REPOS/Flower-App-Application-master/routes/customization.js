const express = require('express');
const router = express.Router();
const Customization = require('../models/customization');
const Product = require('../models/product');

// Get customization page
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.render('customization', { products });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Post customization form
router.post('/', async (req, res) => {
    try {
        const { flowerTypes, message, wrapColor, totalPrice } = req.body;
        // Ensure products is defined and is an array
        const products = await Product.find();
        const flowerNames = products ? products.map(product => product.name) : [];

        const newCustomization = new Customization({
            flowerTypes: flowerNames,
            message,
            wrapColor,
            totalPrice
        });
        await newCustomization.save();
        req.flash('success_msg', 'Customization saved successfully');
        res.redirect('/thankyou');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error saving customization');
        res.redirect('/customization');
    }
});
// GET route to render the customization form
router.get('/', (req, res) => {
    res.render('customization');
});

// POST route to handle order placement
router.post('/place-order', async (req, res) => {
    const { flowerTypes, message, wrapColor, totalPrice } = req.body;
    const newCustomization = new Customization({ flowerTypes, message, wrapColor, totalPrice });
    await newCustomization.save();
    req.flash('success_msg', 'Your order has been placed successfully!');
    res.redirect('/thankyou');
});

module.exports = router;