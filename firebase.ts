import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Replace with your actual Firebase project configuration
// Get this from: Firebase Console -> Project Settings -> General -> Your Apps
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
  // Check if config is dummy or empty, if so, don't crash, just warn
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "YOUR_API_KEY") {
    console.warn("Firebase Config is missing or invalid. App will run in Guest Mode only.");
  } else if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0]; // Use existing app if already initialized
  }

  if (app) {
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    db = getFirestore(app);
  }
} catch (error) {
  console.error("Firebase Initialization Error:", error);
  // App continues to load, but cloud features won't work
}

export { auth, googleProvider, db };