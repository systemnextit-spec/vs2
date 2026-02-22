import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY || "AIzaSyAKHP3mQVTS4bC89758sRxYGCZcnx7jdPY",
  authDomain: "hello-94480.firebaseapp.com",
  projectId: "hello-94480",
  storageBucket: "hello-94480.firebasestorage.app",
  messagingSenderId: "127107907906",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID || "1:127107907906:web:09e78330b89c7dd669c8db"
};
  
// Initialize Firebase - singleton pattern
let app: FirebaseApp;
let auth: Auth;
let provider: GoogleAuthProvider;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  provider = new GoogleAuthProvider();
  
  // Configure provider settings
  provider.addScope('profile');
  provider.addScope('email');
  
  // Set custom parameters to avoid continue URL issues
  provider.setCustomParameters({
    prompt: 'select_account'
  });
} catch (error) {
  console.error('Firebase initialization error:', error);
}

export { auth, provider };
export default app;
