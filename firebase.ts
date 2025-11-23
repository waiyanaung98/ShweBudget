import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Replace with your actual Firebase project configuration
// Get this from: Firebase Console -> Project Settings -> General -> Your Apps
// If deploying to Vercel, use Environment Variables (process.env.VITE_FIREBASE_API_KEY, etc.)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

let app;
let auth: any;
let googleProvider: any;
let db: any;

try {
  // Check if config is dummy or empty to prevent crash
  // This ensures the app loads in "Guest Mode" even if Firebase isn't configured yet.
  const isDummyConfig = !firebaseConfig.apiKey || firebaseConfig.apiKey === "YOUR_API_KEY";
  
  if (!isDummyConfig) {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }

    if (app) {
      auth = getAuth(app);
      googleProvider = new GoogleAuthProvider();
      db = getFirestore(app);
    }
  } else {
      console.warn("Firebase Config missing. App running in Guest Mode.");
  }
} catch (error) {
  console.error("Firebase Initialization Error:", error);
  // App continues to load, but cloud features won't work
}

export { auth, googleProvider, db };