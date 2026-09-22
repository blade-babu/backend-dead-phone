const express = require("express");
const ContactMessage = require("../models/ContactMessage");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// POST /api/contact - "Contact Admins" form
router.post("/", requireAuth, async (req, res) => {
  try {
    const { subject, message } = req.body;
    if (!subject || !message) {
      return res.status(400).json({ error: "subject and message are required" });
    }
    const entry = await ContactMessage.create({
      fromEmail: req.user.email,
      fromName: req.user.name,
      subject,
      message,
    });
    // Optional: wire up an email/Slack notification to ADMIN_EMAILS here.
    res.status(201).json(entry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not send message" });
  }
});

module.exports = router;
