// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { isSupported, getAnalytics } from "firebase/analytics";
import appletConfig from "../../firebase-applet-config.json";

// Konfigurasi manual Firebase dari Anda
const manualConfig = {
  apiKey: "AIzaSyC5NT2WrmPzhTZaYbL2v_ADeI3r85hg8OU",
  authDomain: "sistem-rekomendasi-film.firebaseapp.com",
  projectId: "sistem-rekomendasi-film",
  storageBucket: "sistem-rekomendasi-film.firebasestorage.app",
  messagingSenderId: "353059329327",
  appId: "1:353059329327:web:be322662cef3120f727dda",
  measurementId: "G-5D5TB87TR0"
};

// Initialize Firebase
const app = initializeApp(manualConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firestore
// Gunakan default Firestore database dari Firebase Console Anda
export const db = getFirestore(app);

// Initialize Analytics safely only if supported in this environment (prevents iframe errors)
isSupported().then((supported) => {
  if (supported) {
    getAnalytics(app);
  }
}).catch((err) => {
  console.warn("Analytics initialization skipped or not supported:", err);
});

export default app;