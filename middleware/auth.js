const admin = require("../config/firebaseAdmin");

// Verifies the "Authorization: Bearer <firebase-id-token>" header sent by
// the frontend after a Gmail sign-in through Firebase Auth. On success it
// attaches req.user = { uid, email, name, picture }. The user's Gmail
// address is what the rest of the app treats as their account ID.
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: "Missing auth token" });
    }
    const decoded = await admin.auth().verifyIdToken(token);
    if (!decoded.email) {
      return res.status(403).json({ error: "Account has no email on file" });
    }
    req.user = {
      uid: decoded.uid,
      email: decoded.email.toLowerCase(),
      name: decoded.name || decoded.email.split("@")[0],
      picture: decoded.picture || null,
    };
    next();
  } catch (err) {
    console.error("Auth verification failed:", err.message);
    return res.status(401).json({ error: "Invalid or expired session" });
  }
}

// Same as above but does not fail the request when no/invalid token is
// present - used on public read routes where a logged-in user gets a
// little extra (e.g. "is this my post") but guests can still view.
async function optionalAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return next();
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = {
      uid: decoded.uid,
      email: (decoded.email || "").toLowerCase(),
      name: decoded.name || "",
      picture: decoded.picture || null,
    };
  } catch (_) {
    // ignore invalid token on optional routes
  }
  next();
}

module.exports = { requireAuth, optionalAuth };
