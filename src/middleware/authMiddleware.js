const jwt = require('jsonwebtoken');

const JWT_SECRET = 'reserch';

module.exports = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) return res.status(401).json({ msg: "No token, authorization denied" });

    try {
        const extractedToken = token.split(" ")[1];
        const decoded = jwt.verify(extractedToken, JWT_SECRET);

        if (!decoded.id) {
            return res.status(401).json({ msg: "Invalid token: No user ID found" });
        }

        console.log("Decoded Token Data:", decoded);
        req.user = decoded;
        next();
    } catch (err) {
        console.error("JWT Verification Error:", err.message);
        res.status(401).json({ msg: "Token is not valid" });
    }
};
