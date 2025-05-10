const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
};

// Register a new user
exports.register = async (req, res) => {
    const { firstname, lastname, username, email, password, role } = req.body;

    if (!validateEmail(email)) {
        return res.status(400).json({ msg: "Invalid email format" });
    }

    try {
        // Check if email or username already exists
        const existingUser = await User.findOne({
            $or: [{ email: email }, { username: username }]
        }).exec(); // Ensure query execution to prevent injections
        if (existingUser) {
            return res.status(400).json({ msg: "Email or Username already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            firstname,
            lastname,
            username,
            email,
            password: hashedPassword,
            role: role || 'user'
        });

        await newUser.save();

        res.status(201).json({ msg: "User registered successfully", user: newUser });
    } catch (err) {
        console.error('Error in register:', err.message);
        res.status(500).json({ error: err.message });
    }
};

// Login user
exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Use strict validation to check for the user
        const user = await User.findOne({ username }).exec();
        if (!user) return res.status(400).json({ msg: "Invalid credentials" });

        // Check if password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

        // Ensure JWT_SECRET is properly set
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ msg: "JWT secret key is missing. Please check your .env file." });
        }

        // Create JWT payload (excluding password)
        const payload = {
            sub: user._id,
            id: user._id,
            firstname: user.firstname,
            lastname: user.lastname,
            username: user.username,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            currentDifficulty: user.currentDifficulty,
            fluencyDifficulty: user.fluencyDifficulty
        };

        // Sign JWT token with HS256 algorithm
        const token = jwt.sign(payload, process.env.JWT_SECRET, { algorithm: "HS256", expiresIn: "1h" });

        // Return token and user details
        res.json({
            msg: "Login successful",
            token,
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get logged-in user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password').exec();
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Logout user (Token invalidation is typically handled on the client-side)
exports.logout = (req, res) => {
    res.json({ msg: "Logged out successfully" });
};
