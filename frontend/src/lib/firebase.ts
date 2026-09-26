import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Using the exact config provided by the user directly to avoid any Next.js .env loading issues
const firebaseConfig = {
  apiKey: "AIzaSyDljoZ6hj2oBnxdkcb5un4ug2klaGpg4ZM",
  authDomain: "facevista-f6645.firebaseapp.com",
  projectId: "facevista-f6645",
  storageBucket: "facevista-f6645.firebasestorage.app",
  messagingSenderId: "312002388010",
  appId: "1:312002388010:web:563980e0e98e310e15a353",
  measurementId: "G-7DT5STY9JJ"
};

// Initialize Firebase only if it hasn't been initialized already
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
