const express = require('express');
const router = express.Router();
const Cart = require('../models/cart');
const Product = require('../models/product');
const Order = require('../models/order');
const mongoose = require('mongoose');

const FIXED_USER_ID = new mongoose.Types.ObjectId('66c9b077eb71fd1746d0f65d');

// Fetch cart

// Get cart details
router.get('/', async (req, res) => {
    try {
        // Fetch the cart for the fixed user ID
        console.log('User ID:', FIXED_USER_ID);
        const cart = await Cart.findOne({ userId: FIXED_USER_ID }).populate('items.productId');
        console.log('Fetched Cart:', cart);
        console.log(req.body);
        if (cart) {
            res.render('cart', {
                cartDetails: cart.items.map(item => ({
                    product: item.productId,
                    quantity: item.quantity
                })),
                totalPrice: cart.totalPrice
            });
        } else {
            res.render('cart', { cartDetails: [], totalPrice: 0 });
        }
    } catch (err) {
        console.error('Error fetching cart details:', err);
        req.flash('error_msg', 'Failed to load cart');
        res.redirect('/');
    }
});

// Add to cart route
router.post('/add', async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const qty = parseInt(quantity, 10);

        if (isNaN(qty) || qty <= 0) {
            req.flash('error_msg', 'Invalid quantity');
            return res.redirect('/product');
        }

        console.log('Received productId:', productId);
        console.log('Received quantity:', qty);

        const product = await Product.findById(productId);
        if (!product) {
            req.flash('error_msg', 'Product not found');
            return res.redirect('/product');
        }

        console.log('Product found:', product);

        let cart = await Cart.findOne({ userId: FIXED_USER_ID });
        if (!cart) {
            console.log('Creating new cart for User ID:', FIXED_USER_ID);
            cart = new Cart({ userId: FIXED_USER_ID, items: [], totalPrice: 0 });
        }

        const itemIndex = cart.items.findIndex(item => item.productId.equals(productId));
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += qty;
        } else {
            cart.items.push({ productId, quantity: qty });
        }

        // Recalculate totalPrice
        cart.totalPrice = cart.items.reduce((total, item) => {
            return total + (item.quantity * product.price); // Ensure `product` is used here
        }, 0);

        await cart.save();

        console.log('Cart updated and saved:', cart);

        req.flash('success_msg', 'Product added to cart');
        res.redirect('/cart');
    } catch (error) {
        console.error('Error adding product to cart:', error);
        req.flash('error_msg', 'An error occurred while adding the product to the cart');
        res.redirect('/product');
    }
});



// Place order
router.post('/order', async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: FIXED_USER_ID }).populate('items.productId'); // Populate productId

        if (cart && cart.items.length > 0) { // Ensure the cart has items
            // Create an order
            const newOrder = new Order({
                userId: FIXED_USER_ID, // Use `userId` instead of `user`
                products: cart.items.map(item => ({
                    productId: item.productId._id, // Ensure productId is passed correctly
                    quantity: item.quantity
                })),
                totalPrice: cart.totalPrice
            });

            // Save the order
            await newOrder.save();

            // Clear the cart
            cart.items = [];
            cart.totalPrice = 0;
            await cart.save();

            req.flash('success_msg', 'Order placed successfully!');
            res.redirect('/thankyou'); // Redirect to dashboard after placing order
        } else {
            req.flash('error_msg', 'Your cart is empty.');
            res.redirect('/cart');
        }
    } catch (error) {
        console.error('Error placing order:', error);
        req.flash('error_msg', 'An error occurred while placing the order');
        res.redirect('/cart');
    }
});

module.exports = router;
