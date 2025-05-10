const User = require('../models/User');
const bcrypt = require('bcryptjs');



// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ msg: "Access denied. Admins only." });
        }
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};






