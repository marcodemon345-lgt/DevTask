
const dns = require("node:dns");

// Fix Node.js DNS SRV lookup issue
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

app.use(cors({
  origin: "http://localhost:5173"
}));

app.use(express.json());

// Test API
app.get("/", (req, res) => {
  res.json({
    message: "DevTask API is Running!"
  });
});

// Task API
app.use("/api/tasks", require("./routes/taskRoutes"));

const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
