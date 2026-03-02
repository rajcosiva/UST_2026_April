

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('home');
});

router.get('/dashboard', (req, res) => {
    res.render('dashboard');
});

router.get('/knowmore', (req, res) => {
    res.render('knowmore');
});
// Add this route for thank you page
router.get('/thankyou', (req, res) => {
    res.render('thankyou');
});

module.exports = router;