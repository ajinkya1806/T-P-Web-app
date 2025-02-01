const express = require('express');
const cors = require("cors");
const app = express();
require("dotenv").config(); // Load environment variables
const db = require("./config/db");
const port = 5000; // Port number for your backend

// Middleware to parse JSON requests
app.use(express.json());
app.use(cors());

// Basic Route
app.get('/', (req, res) => {
    res.send('This server is runnning!');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});