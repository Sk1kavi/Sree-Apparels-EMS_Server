const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true
  },
  shift: {
    type: String,
    enum: ['Morning', 'Afternoon' ,'Evening'],
    required: true
  },
  status: {
    type: String,
    enum: ['Present', 'Absent'],
    required: true
  }
}, { timestamps: true });

attendanceSchema.index({ staffId: 1, date: 1, shift: 1 }, { unique: true }); // Prevent duplicate entries

module.exports = mongoose.model('Attendance', attendanceSchema);
