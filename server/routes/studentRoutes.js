const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db"); // Ensure this points to your DB connection
require("dotenv").config();

const router = express.Router();

// **Student Signup**
router.post("/signup", async (req, res) => {
    try {
        const { college_id, department_id, roll_number, name, email, password} = req.body;

        // Check if college & department exist
        const [college] = await db.execute("SELECT * FROM colleges WHERE college_id = ?", [college_id]);
        const [department] = await db.execute("SELECT * FROM departments WHERE department_id = ?", [department_id]);

        if (college.length === 0 || department.length === 0) {
            return res.status(400).json({ message: "Invalid college or department ID" });
        }

        // Check if student already exists
        const [existingStudent] = await db.execute("SELECT * FROM students WHERE email = ?", [email]);
        if (existingStudent.length > 0) {
            return res.status(400).json({ message: "Student with this email already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert student
        await db.execute(
            "INSERT INTO students (college_id, department_id, roll_number, name, email, password_hash) VALUES (?, ?, ?, ?, ?, ?)",
            [college_id, department_id, roll_number, name, email, hashedPassword] // ✅ Correct order
        );

        res.status(201).json({ message: "Student registered successfully" });
    } catch (err) {
        console.error("🔥 Error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// **Student Login**
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if student exists
        const [student] = await db.execute("SELECT * FROM students WHERE email = ?", [email]);
        if (student.length === 0) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const user = student[0];

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { studentId: user.student_id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(200).json({ message: "Login successful", token });
    } catch (err) {
        console.error("🔥 Error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

module.exports = router;
