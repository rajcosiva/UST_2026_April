// Doctor Management Routes
const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const requireAdmin = require('../middleware/requireAdmin');

/**
 * GET /api/doctors
 * Retrieve all doctors (public access)
 */
router.get('/', async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: 'Could not retrieve doctors.' });
  }
});

/**
 * POST /api/doctors
 * Add new doctor (admin only)
 */
router.post('/', requireAdmin, async (req, res) => {
  try {
    const doctor = new Doctor(req.body);
    await doctor.save();
    res.status(201).json(doctor);
  } catch (err) {
    res.status(400).json({ error: 'Could not create doctor.' });
  }
});

/**
 * PUT /api/doctors/:id
 * Update doctor information (admin only)
 */
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedDoctor) {
      return res.status(404).json({ error: 'Doctor not found.' });
    }
    
    res.json(updatedDoctor);
  } catch (err) {
    res.status(400).json({ error: 'Could not update doctor.' });
  }
});

/**
 * DELETE /api/doctors/:id
 * Remove doctor from system (admin only)
 */
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const deletedDoctor = await Doctor.findByIdAndDelete(req.params.id);
    
    if (!deletedDoctor) {
      return res.status(404).json({ error: 'Doctor not found.' });
    }
    
    res.json({ success: true, message: 'Doctor deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Could not delete doctor.' });
  }
});

module.exports = router;
