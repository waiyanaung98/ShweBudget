import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

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

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let googleProvider: GoogleAuthProvider | undefined;
let db: Firestore | undefined;

try {
  // Check if config is dummy
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
      console.warn("Firebase Config is missing or dummy. App allows Guest Mode, but Google Sign-In will fail until configured.");
  }
} catch (error) {
  console.error("Firebase Initialization Error:", error);
}

export { auth, googleProvider, db };