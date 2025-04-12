const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://dbuser:dbuser123@researchproject.ojxgd.mongodb.net/rp_db?retryWrites=true&w=majority&appName=ResearchProject';

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("MongoDB Connected...");
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
