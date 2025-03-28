
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Firebase configuration
// Using default values for development when env variables are not available
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCMe_9AiCipEq10PLOvTAWqoPcYiA9v6t4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "new-project-f3019.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "new-project-f3019",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "new-project-f3019.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "33012730427",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:33012730427:web:2a464f19afd6bde2fdaa1e",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-MQR57G3Z38"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Connect to emulators if in development
if (import.meta.env.DEV) {
  try {
    // Uncomment these when you set up Firebase emulators
    // connectAuthEmulator(auth, 'http://localhost:9099');
    // connectFirestoreEmulator(db, 'localhost', 8080);
    // connectStorageEmulator(storage, 'localhost', 9199);
    console.log('Connected to Firebase emulators');
  } catch (error) {
    console.error('Failed to connect to Firebase emulators', error);
  }
}

export { app, auth, db, storage };
