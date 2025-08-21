const express = require("express");
const router = express.Router();
const stitchingController = require("../controllers/stitchingController");

// GET /api/stitching/tailors?date=YYYY-MM-DD&shift=Morning
router.get("/tailors", stitchingController.getTailorsByShift);

// POST /api/stitching
router.post("/", stitchingController.addStitching);

//POST /api/stitching/bulk
router.post("/bulk", stitchingController.bulkSave);
module.exports = router;
