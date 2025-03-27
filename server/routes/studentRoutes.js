const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db"); // Ensure this points to your DB connection
require("dotenv").config();
const authMiddleware = require("../middleware/authMiddleware");

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
        console.log(token); 

        res.status(200).json({ message: "Login successful", token });
    } catch (err) {
        console.error("🔥 Error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

router.get("/profile", authMiddleware, async (req, res) => {
    try {
        console.log("🔹 Middleware attached studentId:", req.studentId); // Debugging log

        if (!req.studentId) {
            return res.status(400).json({ message: "No student ID found in request" });
        }

        // Fetch student details
        const [student] = await db.execute("SELECT * FROM students WHERE student_id = ?", [req.studentId]);

        if (student.length === 0) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.status(200).json(student[0]); // Return student details
    } catch (err) {
        console.error("🔥 Error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});
// **Update Student Profile (Protected)**
router.put("/profile", authMiddleware, async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const studentId = req.studentId; // From authMiddleware

        // Check if the student exists
        const [student] = await db.execute("SELECT * FROM students WHERE student_id = ?", [studentId]);
        if (student.length === 0) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Create the query for updating the student details
        let updateQuery = "UPDATE students SET name = ?, email = ?";
        let updateValues = [name, email];

        // If password is provided, hash it and include it in the update query
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateQuery += ", password_hash = ?";
            updateValues.push(hashedPassword);
        }

        // Execute the update query with the correct parameters
        await db.execute(updateQuery + " WHERE student_id = ?", [...updateValues, studentId]);

        res.status(200).json({ message: "Profile updated successfully" });
    } catch (err) {
        console.error("🔥 Error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});


module.exports = router;
