const express = require('express');
const router = express.Router();
const Seller = require('../models/seller');

router.get('/', (req, res) => {
    res.render('seller');
});

router.post('/', async (req, res) => {
    const { name, age, gender, phone, email, residentialAddress, farmAddress, bankAccount, ifscCode, flowerTypes } = req.body;
    const newSeller = new Seller({ name, age, gender, phone, email, residentialAddress, farmAddress, bankAccount, ifscCode, flowerTypes });
    await newSeller.save();
    res.render('seller', { success_msg: 'Seller profile created successfully' });

});

module.exports = router;