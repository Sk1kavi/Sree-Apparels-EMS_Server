const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Staff = require('../models/Staff');

// Mark Attendance
router.post('/', async (req, res) => {
   try {
    const data = req.body;

    if (Array.isArray(data)) {
      // Bulk insert
      const saved = await Attendance.insertMany(data);
      res.status(201).json({ message: 'Bulk attendance saved', data: saved });
    } else {
      // Single insert
      const newRecord = new Attendance(data);
      const saved = await newRecord.save();
      res.status(201).json({ message: 'Attendance saved', data: saved });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error saving attendance', error });
  }
});

// Get Attendance by Staff ID
router.get('/staff/:staffId', async (req, res) => {
  try {
    const records = await Attendance.find({ staffId: req.params.staffId }).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Attendance by Date and Shift
// GET /api/attendance?date=YYYY-MM-DD&shift=Morning
router.get('/', async (req, res) => {
  try {
    const { date, shift } = req.query;
    if (!date || !shift) {
      return res.status(400).json({ error: 'Date and shift are required' });
    }

    const records = await Attendance.find({
      date: date,
      shift: shift
    }).populate('staffId', 'name role imageUrl');

    if (records.length > 0) {
      // Attendance already exists → return those records
      return res.json({ type: "attendance", data: records });
    } else {
      // No attendance → return all staff
      const staff = await Staff.find({}, 'name role imageUrl');
      return res.json({ type: "staff", data: staff });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Update Attendance
router.put('/:id', async (req, res) => {
  try {
    const updated = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete Attendance
router.delete('/:id', async (req, res) => {
  try {
    await Attendance.findByIdAndDelete(req.params.id);
    res.json({ message: 'Attendance record deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
