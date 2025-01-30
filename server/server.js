const express = require('express');
const app = express();
const port = 5000; // Port number for your backend

// Middleware to parse JSON requests
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
    res.send('Hello from Express!');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});