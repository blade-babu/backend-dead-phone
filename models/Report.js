const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    reportedSellerEmail: { type: String, required: true, lowercase: true },
    reporterEmail: { type: String, required: true, lowercase: true },
    reason: {
      type: String,
      required: true,
      enum: [
        "Fake or misleading listing",
        "Parts not as described",
        "Scam / did not deliver after payment",
        "Abusive or inappropriate behavior",
        "Other",
      ],
    },
    details: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: ["open", "reviewed", "dismissed"],
      default: "open",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", ReportSchema);
