import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY,
  authDomain: "login-7808a.firebaseapp.com",
  projectId: "login-7808a",
  storageBucket: "login-7808a.appspot.com",
  messagingSenderId: "956776336333",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase - singleton pattern
let app: FirebaseApp;
let auth: Auth;
let provider: GoogleAuthProvider;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  provider = new GoogleAuthProvider();
  
  // Optional: Add additional scopes if needed
  provider.addScope('profile');
  provider.addScope('email');
} catch (error) {
  console.error('Firebase initialization error:', error);
}

export { auth, provider };
export default app;
