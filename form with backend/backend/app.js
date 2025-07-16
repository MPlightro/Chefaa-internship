// updateVerified.js
const admin = require('firebase-admin');
const CryptoJS = require('crypto-js');
const fs = require('fs');
const path = require('path');

// ==== CONFIGURATION ====
// Path to your service account key JSON file
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json'); // <-- update if needed
// Your Firebase Realtime Database URL
const databaseURL = 'https://onthegoheal-default-rtdb.firebaseio.com'; // <-- update this

// ==== INITIALIZE FIREBASE ====
admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath)),
  databaseURL
});

// ==== MAIN LOGIC ====
async function main() {
  const usersRef = admin.database().ref('formApp/users');

  // 1. Get all users from Firebase Auth
  let allUsers = [];
  let nextPageToken;
  do {
    const result = await admin.auth().listUsers(1000, nextPageToken);
    allUsers = allUsers.concat(result.users);
    nextPageToken = result.pageToken;
  } while (nextPageToken);

  // 2. Get all users from Realtime Database
  const usersSnapshot = await usersRef.once('value');
  const dbUsers = usersSnapshot.val() || {};

  // 3. For each verified user, update the DB if needed
  for (const user of allUsers) {
    if (user.emailVerified && user.email) {
      // Find the matching user in your DB by decrypting emails
      const dbUserKey = Object.keys(dbUsers).find(key => {
        try {
          const encryptedEmail = dbUsers[key].email;
          const decryptedEmail = CryptoJS.AES.decrypt(encryptedEmail, key).toString(CryptoJS.enc.Utf8);
          return decryptedEmail === user.email;
        } catch (e) { return false; }
      });

      if (dbUserKey) {
        // Check if already marked as verified
        const encryptedVerified = dbUsers[dbUserKey].verified;
        const decryptedVerified = CryptoJS.AES.decrypt(encryptedVerified, dbUserKey).toString(CryptoJS.enc.Utf8);
        if (decryptedVerified !== "true") {
          // Update verified field to encrypted "true"
          const newEncrypted = CryptoJS.AES.encrypt("true", dbUserKey).toString();
          await usersRef.child(dbUserKey).update({ verified: newEncrypted });
          console.log(`Updated verified for ${user.email}`);
        }
      }
    }
  }
  console.log('Done!');
}

function runWithInterval() {
  console.log(`\n[${new Date().toLocaleString()}] Running updateVerified.js...`);
  main().catch(err => {
    console.error('Error:', err);
  });
}

// Run immediately on start
runWithInterval();
// Then every 5 minutes (300,000 ms)
setInterval(runWithInterval, 300000);