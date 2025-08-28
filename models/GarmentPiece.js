const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

const GarmentPieceSchema = new mongoose.Schema({
  trunkNumber: { type: String, required: true, unique: true },
  itemType: String,
  quantity: { type: Number, required: true },
  receivedDate: { type: Date, default: Date.now },
  dispatchedDate: Date,
  isDispatched: { type: Boolean, default: false },
  expectedPayment: { type: Number, required: true },

  // Payment Tracking
  payments: [PaymentSchema],  // store all partial payments
  totalPaid: { type: Number, default: 0 },
  paymentReceived: { type: Boolean, default: false },

  // Fixed vendor
  vendor: { type: String, default: "Ramraj Company" }
});



module.exports = mongoose.model('GarmentPiece', GarmentPieceSchema);
