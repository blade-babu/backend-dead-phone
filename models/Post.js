const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    // The user's Gmail address is the account ID throughout the app.
    ownerEmail: { type: String, required: true, lowercase: true, index: true },
    ownerName: { type: String, default: "" },

    deviceName: { type: String, required: true, trim: true }, // e.g. "iPhone 12 Pro"
    damageReason: { type: String, required: true, trim: true }, // free text
    waterDamaged: { type: Boolean, required: true },

    // Parts the seller wants to sell off this dead unit. Stored as an array
    // so a post can offer several parts at once. "Add new item" on the
    // frontend just appends a custom string here - no schema change needed.
    partsForSale: {
      type: [String],
      required: true,
      validate: (arr) => Array.isArray(arr) && arr.length > 0,
    },

    // "Are the parts NOT market-original (i.e. genuine/OEM from the device)?"
    // true = parts are NOT original/genuine market parts (copy/aftermarket)
    // false = parts ARE original
    partsNotOriginal: { type: Boolean, required: true },

    location: { type: String, required: true, trim: true },
    contactNumber: { type: String, required: true, trim: true }, // hidden until viewer "unlocks" it
    notes: { type: String, default: "", trim: true },

    images: {
      type: [
        {
          url: { type: String, required: true },
          publicId: { type: String, default: "" }, // CDN asset id, for later deletion
        },
      ],
      default: [],
    },

    status: {
      type: String,
      enum: ["available", "sold"],
      default: "available",
    },

    // simple counters, handy for the feed and for "popular" sorting later
    viewCount: { type: Number, default: 0 },
    contactRevealCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

PostSchema.index({ deviceName: "text", damageReason: "text", location: "text" });

module.exports = mongoose.model("Post", PostSchema);
