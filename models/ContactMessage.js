const mongoose = require("mongoose");

const ContactMessageSchema = new mongoose.Schema(
  {
    fromEmail: { type: String, required: true, lowercase: true },
    fromName: { type: String, default: "" },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    status: { type: String, enum: ["open", "resolved"], default: "open" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ContactMessage", ContactMessageSchema);
