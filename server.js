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

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/posts", postsRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/contact", contactRoutes);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`API running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
