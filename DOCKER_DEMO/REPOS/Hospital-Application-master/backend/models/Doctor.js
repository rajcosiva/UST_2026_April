const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: String,
  department: String,
  timeSlots: [
    {
      start: String, // e.g., "08:00"
      end: String    // e.g., "10:00"
    }
  ],
  fee: String,
});

module.exports = mongoose.model('Doctor', doctorSchema);