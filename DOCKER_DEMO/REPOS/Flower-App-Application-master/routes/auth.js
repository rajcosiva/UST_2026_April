const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');

// Login route
router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username, password });
        if (user) {
            req.flash('success_msg', 'You are now logged in');
            res.redirect('/dashboard');
        } else {
            req.flash('error_msg', 'Invalid credentials');
            res.redirect('/auth/login');
        }
    } catch (err) {
        console.log('Login error:', err);
        req.flash('error_msg', 'An error occurred during login');
        res.redirect('/auth/login');
    }
});
// Signup route
router.get('/signup', (req, res) => {

res.render('signup');
});
router.post('/signup', async (req, res) => {

const { username, password, email } = req.body;
const existingUser = await User.findOne({ username });
if (existingUser) {
    req.flash('error_msg', 'Username already exists');
    res.redirect('/auth/signup');
} else {
    const newUser = new User({ username, password, email });
    await newUser.save();
    req.flash('success_msg', 'You are now registered and can log in');
    res.redirect('/auth/login');
}
});
module.exports = router;