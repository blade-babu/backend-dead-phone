const express = require("express");
const Report = require("../models/Report");
const Post = require("../models/Post");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// POST /api/reports - report a seller on a specific post
router.post("/", requireAuth, async (req, res) => {
  try {
    const { postId, reason, details } = req.body;
    if (!postId || !reason) {
      return res.status(400).json({ error: "postId and reason are required" });
    }
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const report = await Report.create({
      post: post._id,
      reportedSellerEmail: post.ownerEmail,
      reporterEmail: req.user.email,
      reason,
      details: details || "",
    });
    res.status(201).json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not submit report" });
  }
});

// GET /api/reports/mine - reports the current user has filed (optional utility)
router.get("/mine", requireAuth, async (req, res) => {
  const reports = await Report.find({ reporterEmail: req.user.email }).sort({ createdAt: -1 });
  res.json(reports);
});

module.exports = router;
