const mongoose = require("mongoose");

const stitchingSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  shift: {
    type: String,
    enum: ["Morning", "Afternoon", "Evening"],
    required: true,
  },
  tailor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff", // Only tailors
    required: true,
  },
  trunk: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "GarmentPiece", // The most recent received & not dispatched trunk
    required: true,
  },
  stitchedCount: {
    type: Number,
    required: true,
    min: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model("Stitching", stitchingSchema);
