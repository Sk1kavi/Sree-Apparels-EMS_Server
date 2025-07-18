// models/Staff.js
const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ['Tailor', 'Helper'],
    required: true,
  },
  bankAccount: {
    type: String,
  },
  address: {
    type: String,
  },
  imageUrl: {
    type: String,
    default: ''
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Staff', staffSchema);
