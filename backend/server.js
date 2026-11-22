const dns = require("node:dns");

// Fix Node.js DNS SRV lookup issue
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://dev-task-ab2k.vercel.app",
  "https://dev-task-ab2k-mgeybq6gu-dev-hub12.vercel.app",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like curl, Postman, server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      const isAllowedExact = allowedOrigins.includes(origin);
      const isVercelPreview = /^https:\/\/dev-task-ab2k(-[a-z0-9-]+)*\.vercel\.app$/i.test(
        origin
      );

      if (isAllowedExact || isVercelPreview) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json());

// Test API
app.get("/", (req, res) => {
  res.json({
    message: "DevTask API is Running!",
  });
});

// Task API
app.use("/api/tasks", require("./routes/taskRoutes"));

// Ensure DB connection is initialized
connectDB().catch((error) => {
  console.error("Database connection error:", error.message);
});

// Start listening locally / non-Vercel environments
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
