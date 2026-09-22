const express = require("express");
const Post = require("../models/Post");
const { requireAuth, optionalAuth } = require("../middleware/auth");

const router = express.Router();

// GET /api/posts - public feed, with optional filters. Contact number is
// stripped out here; it only comes back through /:id/reveal-contact.
router.get("/", optionalAuth, async (req, res) => {
  try {
    const { q, part, waterDamaged, location, status } = req.query;
    const filter = {};
    if (part) filter.partsForSale = part;
    if (waterDamaged === "true" || waterDamaged === "false") {
      filter.waterDamaged = waterDamaged === "true";
    }
    if (location) filter.location = new RegExp(location, "i");
    filter.status = status === "sold" ? "sold" : "available";
    if (q) filter.$text = { $search: q };

    const posts = await Post.find(filter).sort({ createdAt: -1 }).limit(200).lean();
    const safe = posts.map(({ contactNumber, ...rest }) => rest);
    res.json(safe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load posts" });
  }
});

// GET /api/posts/mine - the logged-in user's own posts (contact number included)
router.get("/mine", requireAuth, async (req, res) => {
  const posts = await Post.find({ ownerEmail: req.user.email }).sort({ createdAt: -1 });
  res.json(posts);
});

// GET /api/posts/:id - single post, contact number stripped unless owner
router.get("/:id", optionalAuth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });

  post.viewCount += 1;
  await post.save();

  const obj = post.toObject();
  if (!req.user || req.user.email !== obj.ownerEmail) {
    delete obj.contactNumber;
  }
  res.json(obj);
});

// POST /api/posts/:id/reveal-contact - "unlock" the number after the
// viewer has seen the ad slot on the frontend. See CONTACT_REVEAL note in
// the frontend ContactReveal component for how the ad gate works.
router.post("/:id/reveal-contact", optionalAuth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });
  post.contactRevealCount += 1;
  await post.save();
  res.json({ contactNumber: post.contactNumber });
});

// POST /api/posts - create a post (auth required). Images are already
// uploaded to the CDN by the frontend before this call; we just store URLs.
router.post("/", requireAuth, async (req, res) => {
  try {
    const {
      deviceName,
      damageReason,
      waterDamaged,
      partsForSale,
      partsNotOriginal,
      location,
      contactNumber,
      notes,
      images,
    } = req.body;

    if (!deviceName || !damageReason || !location || !contactNumber) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    if (!Array.isArray(partsForSale) || partsForSale.length === 0) {
      return res.status(400).json({ error: "Select at least one part to sell" });
    }

    const post = await Post.create({
      ownerEmail: req.user.email,
      ownerName: req.user.name,
      deviceName,
      damageReason,
      waterDamaged: !!waterDamaged,
      partsForSale,
      partsNotOriginal: !!partsNotOriginal,
      location,
      contactNumber,
      notes: notes || "",
      images: Array.isArray(images) ? images : [],
    });

    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not create post" });
  }
});

// PATCH /api/posts/:id/sold - mark as sold (owner only)
router.patch("/:id/sold", requireAuth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });
  if (post.ownerEmail !== req.user.email) {
    return res.status(403).json({ error: "Only the owner can update this post" });
  }
  post.status = "sold";
  await post.save();
  res.json(post);
});

// DELETE /api/posts/:id - owner only
router.delete("/:id", requireAuth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });
  if (post.ownerEmail !== req.user.email) {
    return res.status(403).json({ error: "Only the owner can delete this post" });
  }
  await post.deleteOne();
  // Note: this does not delete the images from the CDN. If you want that
  // too, call Cloudinary's destroy API here using each image's publicId.
  res.json({ success: true });
});

module.exports = router;
