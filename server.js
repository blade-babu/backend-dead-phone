require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const postsRoutes = require("./routes/posts");
const reportsRoutes = require("./routes/reports");
const contactRoutes = require("./routes/contact");

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*" }));
app.use(express.json({ limit: "2mb" }));

// MongoDB Connection with Caching for Serverless
let isConnected = false;
const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    isConnected = true;
    return;
  }
  try {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
  }
};

// Middleware to ensure DB connection before handling API routes
app.use(async (req, res, next) => {
  if (process.env.MONGO_URI) {
    await connectDB();
  }
  next();
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/posts", postsRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/contact", contactRoutes);

// For local development
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`API running locally on port ${PORT}`));
}

// CRITICAL FIX: Export Express app for Vercel Serverless
module.exports = app;
