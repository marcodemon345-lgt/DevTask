const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const taskRoutes = require("./routes/taskRoutes");

const app = express();

// 1. CORS Configuration (Preview URLs + Production Domains)
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://devtask-amla.vercel.app",
  "https://dev-task-ab2k.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Postman / curl / same-origin requests without Origin header
      if (!origin) return callback(null, true);

      const isAllowedExact = allowedOrigins.includes(origin);
      const isVercelPreview = /^https:\/\/dev-task-ab2k.*\.vercel\.app$/.test(
        origin
      );

      if (isAllowedExact || isVercelPreview) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// 2. Cached MongoDB Connection for Vercel Serverless
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MongoDB connection string is missing in environment variables.");
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      })
      .then((mongooseInstance) => mongooseInstance);
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}

// 3. Ensure DB is connected before handling API routes
app.use("/api", async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection error:", error.message);
    res.status(500).json({ message: "Database connection failed", error: error.message });
  }
});

// Root health route
app.get("/", (req, res) => {
  res.json({ message: "DevTask API is Running!" });
});

// Task routes
app.use("/api/tasks", taskRoutes);

// Local development server (Vercel uses exported app)
if (process.env.VERCEL !== "1") {
  const PORT = process.env.PORT || 5000;
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error("Failed to start server:", err.message);
    });
}

module.exports = app;
