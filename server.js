require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./src/config/db');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());

// Database Connection
connectDB();

// Routes
app.use('/auth', require('./src/routes/authRoutes'));
app.use('/users', require('./src/routes/userRoutes'));

// Health Check Endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ message: 'Server is running healthy' });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


