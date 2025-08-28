const mongoose = require("mongoose");

const salaryRecordSchema = new mongoose.Schema({
  month: { type: String, required: true }, // YYYY-MM
  tailors: [
    {
      staffId: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
      name: String,
      salary: Number,
      totalPieces: Number
    }
  ],
  helpers: [
    {
      staffId: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
      name: String,
      salary: Number,
      presentShifts: Number
    }
  ],
  totals: {
    pieces: Number,
    shifts: Number,
    payout: Number
  },
  rates: {
    perPiece: Number,
    perShift: Number
  }
}, { timestamps: true });

salaryRecordSchema.index({ month: 1 }, { unique: true });

module.exports = mongoose.model("SalaryRecord", salaryRecordSchema);
