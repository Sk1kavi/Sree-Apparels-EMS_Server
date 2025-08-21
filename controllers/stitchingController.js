const Stitching = require("../models/Stitching");
const Attendance = require("../models/Attendance");
const Trunk = require("../models/GarmentPiece");

//Fetch tailors present on a given date and shift
exports.getTailorsByShift = async (req, res) => {
  try {
    const { date, shift } = req.query;
    if (!date || !shift) {
      return res.status(400).json({ error: "Date and shift required" });
    }

    // Find attendance records for date + shift where status = Present
    const attendance = await Attendance.find({ date, shift, status: "Present" })
      .populate("staffId");

    console.log("Attendance Records:", attendance);

    // Extract only valid staff entries, then filter Tailors
    const tailors = attendance
      .map((a) => a.staffId) // staffId should now be populated
      .filter((s) => s && s.role === "Tailor"); // 👈 check s is not null

    res.json(tailors);
  } catch (err) {
    console.error("Error in getTailorsByShift:", err);
    res.status(500).json({ error: err.message });
  }
};

// Add or Update a stitching record for recent trunk
exports.addStitching = async (req, res) => {
  try {
    const { date, shift, tailorId, stitchedCount } = req.body;

    // Find most recent trunk that is not dispatched
    const trunk = await Trunk.findOne({ isDispatched: false })
      .sort({ receivedAt: -1 });

    if (!trunk) {
      return res.status(400).json({ error: "No available trunk found" });
    }

    // Check if record already exists for same tailor + date + shift + trunk
    let stitching = await Stitching.findOne({
      date,
      shift,
      tailor: tailorId,
      trunk: trunk._id,
    });

    if (stitching) {
      // Update → add stitched count to existing count
      stitching.stitchedCount += Number(stitchedCount);
      await stitching.save();
      return res.status(200).json({
        message: "Stitched count updated successfully",
        stitching,
      });
    } else {
      // Create new record
      stitching = new Stitching({
        date,
        shift,
        tailor: tailorId,
        trunk: trunk._id,
        stitchedCount,
      });
      await stitching.save();
      return res.status(201).json({
        message: "Stitched count added successfully",
        stitching,
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//Saving the stitched count for all present tailors
// Bulk Save Stitching Records (always create new docs)
exports.bulkSave = async (req, res) => {
  try {
    const { date, shift, records } = req.body;

    // Get most recent trunk that is not dispatched
    const trunk = await Trunk.findOne({ isDispatched: false })
      .sort({ receivedAt: -1 });

    if (!trunk) {
      return res.status(400).json({ error: "No available trunk found" });
    }

    // Attach date, shift, trunkId to each record before insert
    const docs = records.map(r => ({
      date,
      shift,
      trunk: trunk._id,
      tailor: r.tailorId,
      stitchedCount: r.stitchedCount,
    }));

    // Insert all at once
    await Stitching.insertMany(docs);

    res.json({ message: "Bulk save successful", count: docs.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
