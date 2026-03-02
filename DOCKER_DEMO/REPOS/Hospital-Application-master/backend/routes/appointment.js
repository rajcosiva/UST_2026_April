// Appointment Management Routes
const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const { sendAppointmentConfirmation, sendAppointmentCancellation } = require('../services/notificationService');

/**
 * GET /api/appointments
 * Retrieve all appointments sorted by date and time
 */
router.get('/', async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ date: 1, time: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: 'Could not read appointments.' });
  }
});

/**
 * POST /api/appointments
 * Create a new appointment with conflict checking and email notification
 */
router.post('/', async (req, res) => {
  try {
    // Prevent double booking - check if the doctor is already booked at this time
    const conflict = await Appointment.findOne({
      doctorName: req.body.doctorName,
      date: req.body.date,
      time: req.body.time,
      status: { $ne: 'cancelled' }
    });
    
    if (conflict) {
      return res.status(409).json({ error: 'This slot is already booked.' });
    }

    // Create and save new appointment
    const newAppointment = new Appointment(req.body);
    await newAppointment.save();

    // Send confirmation email (optional - only if email provided)
    if (req.body.patientEmail) {
      try {
        await sendAppointmentConfirmation(newAppointment, req.body.patientEmail);
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
      }
    }

    res.status(201).json(newAppointment);
  } catch (err) {
    res.status(500).json({ error: 'Could not save appointment.' });
  }
});

/**
 * PUT /api/appointments/:id
 * Update an existing appointment with conflict checking
 */
router.put('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Check for scheduling conflicts when updating time/date/doctor
    if (req.body.date || req.body.time || req.body.doctorName) {
      const conflict = await Appointment.findOne({
        _id: { $ne: req.params.id }, // Exclude current appointment
        doctorName: req.body.doctorName || appointment.doctorName,
        date: req.body.date || appointment.date,
        time: req.body.time || appointment.time,
        status: { $ne: 'cancelled' }
      });
      
      if (conflict) {
        return res.status(409).json({ error: 'This slot is already booked' });
      }
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // Return updated document
    );

    res.json(updatedAppointment);
  } catch (err) {
    res.status(500).json({ error: 'Could not update appointment.' });
  }
});

/**
 * DELETE /api/appointments/:id
 * Permanently delete an appointment (hard delete)
 */
router.delete('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Permanently remove the appointment
    await Appointment.findByIdAndDelete(req.params.id);

    // Notify patient of cancellation (optional - only if email provided)
    if (req.body.patientEmail) {
      try {
        await sendAppointmentCancellation(appointment, req.body.patientEmail);
      } catch (emailError) {
        console.error('Failed to send cancellation email:', emailError);
      }
    }

    res.json({ success: true, message: 'Appointment deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Could not delete appointment.' });
  }
});

/**
 * PATCH /api/appointments/:id/cancel
 * Cancel an appointment (soft delete - keeps record but marks as cancelled)
 */
router.patch('/:id/cancel', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Mark as cancelled instead of deleting
    appointment.status = 'cancelled';
    await appointment.save();

    // Send cancellation notification (optional - only if email provided)
    if (req.body.patientEmail) {
      try {
        await sendAppointmentCancellation(appointment, req.body.patientEmail);
      } catch (emailError) {
        console.error('Failed to send cancellation email:', emailError);
      }
    }

    res.json({ success: true, message: 'Appointment cancelled successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Could not cancel appointment.' });
  }
});

module.exports = router;