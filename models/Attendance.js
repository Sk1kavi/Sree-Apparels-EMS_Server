const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Leave'],
    required: true
  }
}, {
  timestamps: true
});

attendanceSchema.index({ staffId: 1, date: 1 }, { unique: true }); // Prevent duplicate entries

module.exports = mongoose.model('Attendance', attendanceSchema);
