const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const Order = require('../models/order');


// Get products page
router.get('/', async (req, res) => {
    const products = await Product.find();
    res.render('products', { products });
});

// Add to cart
router.post('/add', (req, res) => {
    const { productId } = req.body;
    const cart = req.session.cart || [];

    const productIndex = cart.findIndex(item => item.productId === productId);
    if (productIndex >= 0) {
        cart[productIndex].quantity += 1;
    } else {
        cart.push({ productId, quantity: 1 });
    }

    req.session.cart = cart;
    req.flash('success_msg', 'Product added to cart');
    res.redirect('/product');
});
/*
// View cart and calculate total price
router.get('/cart', (req, res) => {
    try {
        const cartDetails = req.session.cart || [];
        const totalPrice = cartDetails.reduce((total, item) => {
            if (item.product) {
                return total + (item.product.price * item.quantity);
            }
            return total;
        }, 0);

        res.render('cart', { cartDetails, totalPrice });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});
*/
// View cart
router.get('/cart', async (req, res) => {
    const cart = req.session.cart || [];
    const cartDetails = await Promise.all(cart.map(async item => {
        const product = await Product.findById(item.productId);
        return {
            product,
            quantity: item.quantity
        };
    }));

    const totalPrice = cartDetails.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    res.render('cart', { cartDetails, totalPrice });
});



// Place order route
router.post('/place-order', async (req, res) => {
    try {
        console.log('Received payload:', req.body);

        const cart = req.session.cart || [];

        if (cart.length === 0) {
            req.flash('error_msg', 'Your cart is empty');
            return res.redirect('/product');
        }

        const orderDetails = await Promise.all(cart.map(async item => {
            const product = await Product.findById(item.productId);
            return {
                product,
                quantity: item.quantity
            };
        }));

        // Check if all products exist and have prices
        for (let item of orderDetails) {
            if (!item.product || !item.product.price) {
                req.flash('error_msg', 'Invalid product in order details');
                return res.redirect('/product');
            }
        }

        // Calculate total price
        const totalPrice = orderDetails.reduce((total, item) => {
            return total + (item.product.price * item.quantity);
        }, 0);

        // Create and save new order
        const newOrder = new Order({
            user: req.user.id,
            orderDetails,
            totalPrice
        });
        await newOrder.save();

        // Clear cart
        req.session.cart = [];

        req.flash('success_msg', 'Order placed successfully');
        res.redirect('/thankyou');
    } catch (err) {
        console.error('Error placing order:', err);
        req.flash('error_msg', 'Failed to place order');
        res.redirect('/product');
    }
});

// Route to display products
router.get('/', async (req, res) => {
    const products = await Product.find();
    res.render('products', { products });
});

// Route to handle adding products to cart (assuming you have a cart mechanism)
router.post('/order', async (req, res) => {
    const { productId } = req.body;
    const product = await Product.findById(productId);
    
    // Assuming you have a cart mechanism
    // Add the product to the cart (This is just an example, implement your own logic)
    // req.session.cart.push(product);

    req.flash('success_msg', 'Product added to cart successfully');
    res.redirect('/product');
});
/*// Route to add a new product (for testing purposes)
router.post('/add', async (req, res) => {
    try {
        const { name, description, price } = req.body;
        const newProduct = new Product({ name, description, price });
        await newProduct.save();
        res.redirect('/product');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});
*/
// Handle order submission and redirect to Thank You page
router.post('/order', (req, res) => {
    // Handle order logic (e.g., save order to database, clear cart, etc.)
    // For simplicity, we'll just redirect to the thank you page
    res.redirect('/thankyou');
});

module.exports = router;
