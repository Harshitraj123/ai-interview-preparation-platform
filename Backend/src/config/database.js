const mongoose = require("mongoose");

async function connectDatabase() {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
        throw new Error(
            "MONGO_URI is missing. Configure it in your environment."
        );
    }

    try {
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 10000,
        });

        console.log("MongoDB connection established.");

        return mongoose.connection;
    } catch (error) {
        console.error("Unable to connect to MongoDB:", error.message);
        throw error;
    }
}

module.exports = connectDatabase;