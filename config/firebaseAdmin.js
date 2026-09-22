// Initializes the Firebase Admin SDK so the backend can verify the
// Firebase ID tokens that the frontend sends after Google sign-in.
//
// Get the credentials from: Firebase Console -> Project Settings ->
// Service Accounts -> "Generate new private key". Either:
//   a) paste the whole JSON as one line into FIREBASE_SERVICE_ACCOUNT_JSON, or
//   b) save the file as backend/serviceAccountKey.json (gitignored) and
//      this file will fall back to reading it from disk.

const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

function loadServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  }
  const localPath = path.join(__dirname, "..", "serviceAccountKey.json");
  if (fs.existsSync(localPath)) {
    return require(localPath);
  }
  throw new Error(
    "Missing Firebase service account. Set FIREBASE_SERVICE_ACCOUNT_JSON or add backend/serviceAccountKey.json"
  );
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(loadServiceAccount()),
  });
}

module.exports = admin;
