const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; 
    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded);  // Log decoded token to see if studentId is there
        req.studentId = decoded.studentId; 
        // const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        // req.user = decoded;
        next();
    } catch (err) {
        res.status(400).json({ message: "Invalid token" });
    }
};

module.exports = authenticate;
