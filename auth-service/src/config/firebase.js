const admin = require('firebase-admin');

/**
 * Initialize Firebase Admin SDK
 * Using environment variables for credentials
 */
const initializeFirebase = () => {
  try {
    // Check if Firebase is already initialized
    if (admin.apps.length > 0) {
      console.log('✅ Firebase already initialized');
      return admin.app();
    }

    // Initialize with credentials from environment variables
    const serviceAccount = {
      type: 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log('✅ Firebase Admin SDK initialized successfully');
    return admin.app();
  } catch (error) {
    console.error('❌ Error initializing Firebase:', error.message);
    throw error;
  }
};

/**
 * Verify Firebase ID token
 * @param {string} idToken - Firebase ID token from client
 * @returns {Promise<object>} Decoded token
 */
const verifyFirebaseToken = async (idToken) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    throw new Error(`Firebase token verification failed: ${error.message}`);
  }
};

/**
 * Get user by UID from Firebase
 * @param {string} uid - Firebase user UID
 * @returns {Promise<object>} Firebase user record
 */
const getFirebaseUser = async (uid) => {
  try {
    const userRecord = await admin.auth().getUser(uid);
    return userRecord;
  } catch (error) {
    throw new Error(`Error fetching Firebase user: ${error.message}`);
  }
};

/**
 * Create custom claims for Firebase user (for role-based access)
 * @param {string} uid - Firebase user UID
 * @param {object} claims - Custom claims to set
 */
const setCustomClaims = async (uid, claims) => {
  try {
    await admin.auth().setCustomUserClaims(uid, claims);
    console.log(`✅ Custom claims set for user ${uid}`);
  } catch (error) {
    throw new Error(`Error setting custom claims: ${error.message}`);
  }
};

module.exports = {
  initializeFirebase,
  verifyFirebaseToken,
  getFirebaseUser,
  setCustomClaims,
  admin,
};