import Admin from "../models/Admin.js";
import Staff from "../models/Staff.js";

// Staff login with mobile number
export const staffLogin = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: "Mobile number required" });
    }

    const staff = await Staff.findOne({ phone });
    if (!staff) return res.status(404).json({ error: "Staff not found" });

    res.json({ success: true, role: "staff", staff });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin login with email & password
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email & password required" });

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ error: "Admin not found" });

    if (password !== admin.password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({ success: true, role: "admin", admin });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
