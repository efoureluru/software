const admin = require('firebase-admin');

// Note: In production, use service account credentials from environment variables
// For now, we initialize with minimal config and expect GOOGLE_APPLICATION_CREDENTIALS
// or detailed env vars: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY

if (!admin.apps.length) {
    try {
        if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                }),
            });
            console.log('Firebase Admin initialized successfully');
        } else {
            console.warn('Firebase environment variables missing. Firebase features will not work.');
        }
    } catch (error) {
        console.error('Firebase initialization error', error);
    }
}

module.exports = admin;
