
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error("MONGODB_URI is missing in .env file");
    }

    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("================================");
    console.log("MongoDB Connected Successfully!");
    console.log("Database:", mongoose.connection.name);
    console.log("Host:", mongoose.connection.host);
    console.log("================================");

  } catch (error) {
    console.error("MongoDB Connection Failed!");
    console.error("Error:", error.message);
    throw error;
  }
};

module.exports = connectDB;
