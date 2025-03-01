const mongoose = require("mongoose");
require("dotenv").config(); // Load environment variables

//Imports the dotenv package into your application.
//This package helps load environment variables from a .env file.
async function DBConnect() {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
        console.error("❌ MongoDB URI is missing in .env file!");
        process.exit(1);
    }

    try {
        await mongoose.connect(mongoURI);
        console.log("✅ Connected to MongoDB");
    } catch (err) {
        console.error("❌ DB Connection Error:", err.message);
        process.exit(1);//stops the server when the database connection fails.
    }
}

module.exports = DBConnect;
