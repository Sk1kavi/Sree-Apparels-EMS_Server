const express = require("express");
const router = express.Router();
const mongoose=require("mongoose");
const Attendance = require("../models/Attendance");
const Stitching = require("../models/Stitching");
const SalaryRecord = require("../models/SalaryRecord");
const Staff = require("../models/Staff");

// === Attendance Analysis ===
// GET /api/analysis/attendance/:staffId?year=YYYY&month=MM
router.get("/attendance/:staffId", async (req, res) => {
    try {
        const { staffId } = req.params;
        const { year, month } = req.query;

        // Match records by staffId and year/month
        const regex = new RegExp(`^${year}-${month.padStart(2, "0")}-`);
        const records = await Attendance.find({
            staffId,
            date: { $regex: regex }
        });

        // Aggregate data per day
        const result = {};
        records.forEach(r => {
            if (!result[r.date]) result[r.date] = { presentShifts: 0, absentShifts: 0 };
            if (r.status === "Present") result[r.date].presentShifts += 1;
            else result[r.date].absentShifts += 1;
        });

        const response = Object.keys(result).sort().map(date => ({
            date,
            ...result[date]
        }));

        res.json(response);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
    }
});

// === Salary Analysis ===
// GET /api/analysis/salary/:staffId?year=YYYY&month=MM
router.get("/salary/:staffId", async (req, res) => {
    try {
        const { staffId } = req.params;
        const { year, month } = req.query;

        const monthStr = `${year}-${month.padStart(2, "0")}`;
        const staffObjId = new mongoose.Types.ObjectId(staffId);


        const salaryRecord = await SalaryRecord.findOne({
            month: monthStr,
            $or: [
                { "tailors.staffId": staffObjId },
                { "helpers.staffId": staffObjId }
            ]
        });

        if (!salaryRecord) return res.json([]);

        let salaryData;
        const staff = await Staff.findById(staffId);

        if (staff.role === "Tailor") {
            const tailorData = salaryRecord.tailors.find(t => t.staffId.toString() === staffId);
            salaryData = tailorData ? [{ month: monthStr, salary: tailorData.salary }] : [];
        } else {
            const helperData = salaryRecord.helpers.find(h => h.staffId.toString() === staffId);
            salaryData = helperData ? [{ month: monthStr, salary: helperData.salary }] : [];
        }
        console.log("salaryData:", salaryData);

        res.json(salaryData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
    }
});

// === Stitching Analysis (Tailors Only) ===
// GET /api/analysis/stitching/:staffId?year=YYYY&month=MM
router.get("/stitching/:staffId", async (req, res) => {
    try {
        const { staffId } = req.params;
        const { year, month } = req.query;

        const staff = await Staff.findById(staffId);
        if (!staff || staff.role !== "Tailor") return res.status(400).json({ error: "Not a tailor" });

        const startDate = new Date(`${year}-${month.padStart(2, "0")}-01`);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);

        const records = await Stitching.find({
            tailor: staffId,
            date: { $gte: startDate, $lt: endDate }
        });

        const result = {};
        records.forEach(r => {
            const dateStr = r.date.toISOString().slice(0, 10);
            if (!result[dateStr]) result[dateStr] = 0;
            result[dateStr] += r.stitchedCount;
        });

        const response = Object.keys(result).sort().map(date => ({
            date,
            stitchedCount: result[date]
        }));

        res.json(response);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
    }
});

module.exports = router;
