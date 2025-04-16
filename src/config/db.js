const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://minidu:minidu@ctse.hvu4z1i.mongodb.net/ctse_db?retryWrites=true&w=majority&appName=CTSE';

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
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
