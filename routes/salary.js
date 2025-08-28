// routes/salary.js
const express = require("express");
const router = express.Router();
const Staff = require("../models/Staff");
const Stitching = require("../models/Stitching");
const Attendance = require("../models/Attendance");
const SalaryRecord = require("../models/SalaryRecord");


// Helpers
function startEndFromQuery(q) {
  // supports ?month=YYYY-MM  OR  ?start=YYYY-MM-DD&end=YYYY-MM-DD
  let startDate, endDate, startStr, endStr;
  if (q.month) {
    const [y, m] = q.month.split("-").map(Number); // e.g. 2025-08
    startDate = new Date(y, m - 1, 1, 0, 0, 0, 0);
    endDate = new Date(y, m, 0, 23, 59, 59, 999); // last day
  } else {
    startDate = q.start ? new Date(q.start + "T00:00:00.000Z") : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    endDate = q.end ? new Date(q.end + "T23:59:59.999Z") : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59, 999);
  }
  // Attendance.date is a STRING (YYYY-MM-DD), so use string comparisons
  const pad = n => n.toString().padStart(2, "0");
  const toStr = d => `${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())}`;
  startStr = toStr(startDate);
  endStr = toStr(endDate);
  return { startDate, endDate, startStr, endStr };
}

/**
 * GET /api/salary/summary
 * Query:
 *   month=YYYY-MM  (or start=YYYY-MM-DD&end=YYYY-MM-DD)
 *   ratePerPiece=number  ratePerShift=number  (optional; default 0)
 */
router.get("/summary", async (req, res) => {
  try {
    const { startDate, endDate, startStr, endStr } = startEndFromQuery(req.query);
    const ratePerPiece = Number(req.query.ratePerPiece ?? 0);
    const ratePerShift = Number(req.query.ratePerShift ?? 0);

    // Tailors: Staff -> left lookup Stitching in date window -> sum stitchedCount
    const tailors = await Staff.aggregate([
      { $match: { role: "Tailor" } },
      {
        $lookup: {
          from: "stitchings", // collection name (pluralized model)
          let: { tailorId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$tailor", "$$tailorId"] },
                    { $gte: ["$date", startDate] },
                    { $lte: ["$date", endDate] }
                  ]
                }
              }
            },
            { $group: { _id: null, totalPieces: { $sum: "$stitchedCount" } } }
          ],
          as: "stitchAgg"
        }
      },
      {
        $addFields: {
          totalPieces: { $ifNull: [{ $arrayElemAt: ["$stitchAgg.totalPieces", 0] }, 0] },
          salary: { $multiply: [{ $ifNull: [{ $arrayElemAt: ["$stitchAgg.totalPieces", 0] }, 0] }, ratePerPiece] }
        }
      },
      { $project: { _id: 1, name: 1, imageUrl: 1, role: 1, totalPieces: 1, salary: 1 } },
      { $sort: { name: 1 } }
    ]);

    // Helpers: Staff -> left lookup Attendance (Present) in date window -> count docs (shifts)
    const helpers = await Staff.aggregate([
      { $match: { role: "Helper" } },
      {
        $lookup: {
          from: "attendances",
          let: { staffId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$staffId", "$$staffId"] },
                    { $eq: ["$status", "Present"] },
                    // Attendance.date is STRING "YYYY-MM-DD"
                    { $gte: ["$date", startStr] },
                    { $lte: ["$date", endStr] }
                  ]
                }
              }
            },
            { $group: { _id: null, presentShifts: { $sum: 1 } } }
          ],
          as: "attAgg"
        }
      },
      {
        $addFields: {
          presentShifts: { $ifNull: [{ $arrayElemAt: ["$attAgg.presentShifts", 0] }, 0] },
          salary: { $multiply: [{ $ifNull: [{ $arrayElemAt: ["$attAgg.presentShifts", 0] }, 0] }, ratePerShift] }
        }
      },
      { $project: { _id: 1, name: 1, imageUrl: 1, role: 1, presentShifts: 1, salary: 1 } },
      { $sort: { name: 1 } }
    ]);

    const totalPieces = tailors.reduce((s, t) => s + (t.totalPieces || 0), 0);
    const totalShifts = helpers.reduce((s, h) => s + (h.presentShifts || 0), 0);
    const totalPayout =
      tailors.reduce((s, t) => s + (t.salary || 0), 0) +
      helpers.reduce((s, h) => s + (h.salary || 0), 0);

    res.json({
      period: { start: startStr, end: endStr },
      rates: { perPiece: ratePerPiece, perShift: ratePerShift },
      tailors,
      helpers,
      totals: { pieces: totalPieces, shifts: totalShifts, payout: totalPayout }
    });
  } catch (err) {
    console.error("Salary summary error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Finalize salaries
router.post("/finalize", async (req, res) => {
  try {
    const { month, tailors, helpers, totals, rates } = req.body;

    if (!month || !tailors || !helpers || !totals || !rates) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Either insert new or update existing for that month
    const record = await SalaryRecord.findOneAndUpdate(
      { month },
      { month, tailors, helpers, totals, rates },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ message: "Salary finalized", record });
  } catch (err) {
    console.error("Finalize salary error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
