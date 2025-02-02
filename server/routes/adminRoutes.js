const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db"); // Database connection

const router = express.Router();

// Admin Signup Route
router.post("/signup", async (req, res) => {
    const { college_id, name, email, password } = req.body;

    try {
        // Check if the email already exists
        const [existingAdmin] = await db.execute("SELECT * FROM admins WHERE email = ?", [email]);
        if (existingAdmin.length > 0) {
            return res.status(400).json({ message: "Admin with this email already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the new admin
        const [newAdmin] = await db.execute(
            "INSERT INTO admins (college_id, name, email, password_hash) VALUES (?, ?, ?, ?)",
            [college_id, name, email, hashedPassword]
        );

        return res.status(201).json({ message: "Admin created successfully", adminId: newAdmin.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// Admin Login Route
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the admin exists
        const [admin] = await db.execute("SELECT * FROM admins WHERE email = ?", [email]);
        if (admin.length === 0) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Compare the password
        const isMatch = await bcrypt.compare(password, admin[0].password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Generate a JWT token
        const token = jwt.sign({ adminId: admin[0].admin_id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.status(200).json({ message: "Login successful", token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;