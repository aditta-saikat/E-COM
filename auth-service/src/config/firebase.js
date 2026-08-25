const admin = require('firebase-admin');

let firebaseApp;

const initializeFirebase = () => {
	if (firebaseApp) {
		return firebaseApp;
	}

	const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;

	if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
		throw new Error(
			'FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are required',
		);
	}

	firebaseApp = admin.initializeApp({
		credential: admin.credential.cert({
			projectId: FIREBASE_PROJECT_ID,
			clientEmail: FIREBASE_CLIENT_EMAIL,
			privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
		}),
	});

	return firebaseApp;
};

const getFirebaseAuth = () => {
	initializeFirebase();
	return admin.auth();
};

module.exports = { getFirebaseAuth, initializeFirebase };
