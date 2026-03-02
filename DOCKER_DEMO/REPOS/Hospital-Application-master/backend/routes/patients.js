// Patient Management and Authentication Routes
const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * POST /api/patients/register
 * Register new patient account with validation
 */
router.post('/register', async (req, res) => {
  try {
    const { username, password, name, contact, email } = req.body;

    // Validate required fields
    if (!username || !password || !name || !contact || !email) {
      return res.status(400).json({ 
        error: 'All fields are required: username, password, name, contact, email' 
      });
    }

    // Check if patient already exists
    const existingPatient = await Patient.findOne({ 
      $or: [{ username }, { contact }, { email }] 
    });
    
    if (existingPatient) {
      return res.status(400).json({ 
        error: 'Username, contact, or email already exists' 
      });
    }

    // Hash password before storing
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new patient record
    const patient = new Patient({
      username,
      password: hashedPassword,
      name,
      contact,
      email
    });

    await patient.save();

    // Generate JWT token for immediate login
    const token = jwt.sign(
      { patientId: patient._id, username: patient.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully',
      token,
      patient: {
        id: patient._id,
        username: patient.username,
        name: patient.name,
        contact: patient.contact,
        email: patient.email
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
});

/**
 * POST /api/patients/login
 * Authenticate patient and return JWT token
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Username and password are required' 
      });
    }

    // Find patient by username
    const patient = await Patient.findOne({ username });
    if (!patient) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password against hashed password
    const isValidPassword = await bcrypt.compare(password, patient.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token for session management
    const token = jwt.sign(
      { patientId: patient._id, username: patient.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      patient: {
        id: patient._id,
        username: patient.username,
        name: patient.name,
        contact: patient.contact,
        email: patient.email
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

/**
 * Authentication middleware to verify JWT token
 * Adds patient data to req.patient for authenticated routes
 */
const authenticatePatient = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const patient = await Patient.findById(decoded.patientId);
    
    if (!patient) {
      return res.status(401).json({ error: 'Invalid token.' });
    }

    req.patient = patient;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

/**
 * GET /api/patients/appointments
 * Retrieve all appointments for authenticated patient
 */
router.get('/appointments', authenticatePatient, async (req, res) => {
  try {
    // Use patientId for stable reference, fallback to patientContact for backwards compatibility
    const appointments = await Appointment.find({ 
      $or: [
        { patientId: req.patient._id },
        { patientContact: req.patient.contact }
      ]
    }).sort({ date: 1, time: 1 });
    
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch appointments' });
  }
});

// Update patient's appointment (authenticated)
router.put('/appointments/:id', authenticatePatient, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Verify the appointment belongs to this patient (use patientId for stable reference)
    const belongsToPatient = appointment.patientId && appointment.patientId.equals(req.patient._id) ||
                            appointment.patientContact === req.patient.contact;
    
    if (!belongsToPatient) {
      return res.status(403).json({ error: 'Not authorized to modify this appointment' });
    }

    // Check for conflicts if date/time is being changed
    if (req.body.date || req.body.time || req.body.doctorName) {
      const conflict = await Appointment.findOne({
        _id: { $ne: req.params.id },
        doctorName: req.body.doctorName || appointment.doctorName,
        date: req.body.date || appointment.date,
        time: req.body.time || appointment.time
      });
      
      if (conflict) {
        return res.status(409).json({ error: 'This slot is already booked' });
      }
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedAppointment);
  } catch (err) {
    res.status(500).json({ error: 'Could not update appointment' });
  }
});

// Cancel patient's appointment (authenticated)
router.delete('/appointments/:id', authenticatePatient, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Verify the appointment belongs to this patient (use patientId for stable reference)
    const belongsToPatient = appointment.patientId && appointment.patientId.equals(req.patient._id) ||
                            appointment.patientContact === req.patient.contact;
    
    if (!belongsToPatient) {
      return res.status(403).json({ error: 'Not authorized to cancel this appointment' });
    }

    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Appointment cancelled successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Could not cancel appointment' });
  }
});

// Get patient profile (authenticated)
router.get('/profile', authenticatePatient, async (req, res) => {
  try {
    res.json({
      id: req.patient._id,
      username: req.patient.username,
      name: req.patient.name,
      contact: req.patient.contact,
      email: req.patient.email
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch profile' });
  }
});

// Data migration helper: Link existing appointments to patient (authenticated)
router.post('/link-appointments', authenticatePatient, async (req, res) => {
  try {
    // Find appointments that belong to this patient but don't have patientId set
    const appointments = await Appointment.find({
      patientContact: req.patient.contact,
      patientId: { $exists: false }
    });

    if (appointments.length === 0) {
      return res.json({
        success: true,
        message: 'No appointments need linking',
        linked: 0
      });
    }

    // Update all matching appointments to include patientId
    const updateResult = await Appointment.updateMany(
      {
        patientContact: req.patient.contact,
        patientId: { $exists: false }
      },
      {
        $set: { patientId: req.patient._id }
      }
    );

    res.json({
      success: true,
      message: `Linked ${updateResult.modifiedCount} appointments to your profile`,
      linked: updateResult.modifiedCount
    });
  } catch (err) {
    console.error('Link appointments error:', err);
    res.status(500).json({ error: 'Could not link appointments' });
  }
});

// Update patient profile (authenticated)
router.put('/profile', authenticatePatient, async (req, res) => {
  try {
    const { name, contact, email } = req.body;
    
    // Check if contact or email is already taken by another patient
    if (contact || email) {
      const existingPatient = await Patient.findOne({
        _id: { $ne: req.patient._id },
        $or: [
          ...(contact ? [{ contact }] : []),
          ...(email ? [{ email }] : [])
        ]
      });
      
      if (existingPatient) {
        return res.status(400).json({ 
          error: 'Contact or email already exists' 
        });
      }
    }

    // Store old contact for linking appointments
    const oldContact = req.patient.contact;
    
    const updatedPatient = await Patient.findByIdAndUpdate(
      req.patient._id,
      { name, contact, email },
      { new: true }
    );

    // If contact, name, or email was updated, automatically update all existing appointments
    if ((contact && contact !== oldContact) || (name && name !== req.patient.name)) {
      try {
        // Update appointments that are linked to this patient (by patientId OR old contact)
        const updateResult = await Appointment.updateMany(
          {
            $or: [
              { patientId: req.patient._id },
              { patientContact: oldContact }
            ]
          },
          {
            $set: { 
              patientId: req.patient._id,
              patientContact: contact || req.patient.contact,
              patientName: name || req.patient.name
            }
          }
        );
        console.log(`Updated ${updateResult.modifiedCount} appointments for patient ${req.patient._id} after profile update`);
      } catch (updateError) {
        console.error('Failed to update appointments after profile update:', updateError);
        // Don't fail the profile update if appointment update fails
      }
    }

    res.json({
      id: updatedPatient._id,
      username: updatedPatient.username,
      name: updatedPatient.name,
      contact: updatedPatient.contact,
      email: updatedPatient.email
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Could not update profile' });
  }
});

// Book new appointment (authenticated)
router.post('/book-appointment', authenticatePatient, async (req, res) => {
  try {
    const { department, doctorName, date, time, symptoms, patientAddress } = req.body;

    // Validate required fields
    if (!department || !doctorName || !date || !time || !symptoms || !patientAddress) {
      return res.status(400).json({
        error: 'All fields are required: department, doctorName, date, time, symptoms, patientAddress'
      });
    }

    // Check for existing appointment with same doctor, date, and time
    const conflict = await Appointment.findOne({
      doctorName,
      date,
      time,
      status: { $ne: 'cancelled' }
    });
    
    if (conflict) {
      return res.status(409).json({ error: 'This slot is already booked.' });
    }

    // Create new appointment with patient details
    const newAppointment = new Appointment({
      patientName: req.patient.name,
      patientContact: req.patient.contact,
      patientAddress,
      symptoms,
      department,
      doctorName,
      date,
      time,
      patientId: req.patient._id, // Link to patient ID for stable reference
      status: 'scheduled'
    });

    await newAppointment.save();

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointment: newAppointment
    });
  } catch (err) {
    console.error('Appointment booking error:', err);
    res.status(500).json({ error: 'Could not book appointment', details: err.message });
  }
});

/**
 * GET /api/patients/all
 * Get all patients for admin dashboard (admin only)
 */
router.get('/all', async (req, res) => {
  try {
    const patients = await Patient.find({})
      .select('-password') // Exclude password field
      .sort({ createdAt: -1 }); // Sort by newest first
    
    res.json(patients);
  } catch (err) {
    console.error('Error fetching all patients:', err);
    res.status(500).json({ error: 'Could not fetch patients' });
  }
});

module.exports = router;
