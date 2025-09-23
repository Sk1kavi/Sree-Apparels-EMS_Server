const express = require("express");
const { staffLogin, adminLogin } = require("../controllers/authController");

const router = express.Router();

router.post("/staff/login", staffLogin);
router.post("/admin/login", adminLogin);

module.exports = router;
