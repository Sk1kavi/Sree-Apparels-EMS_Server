// models/GarmentPiece.js
const mongoose = require('mongoose');

const GarmentPieceSchema = new mongoose.Schema({
  trunkNumber: { type: String, required: true, unique: true },
  itemType: String,
  quantity: { type: Number, required: true },
  receivedDate: { type: Date, default: Date.now },
  dispatchedDate: Date,
  isDispatched: { type: Boolean, default: false },
  paymentReceived: { type: Boolean, default: false },
  paymentAmount: { type: Number, default: 0 },
  expectedPayment: { type: Number, required: true },
});

module.exports = mongoose.model('GarmentPiece', GarmentPieceSchema);
