// lib/firebase.ts

// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration (update with your actual config)
const firebaseConfig = {
  apiKey: "AIzaSyBhaGGa0HghN3SgvSf9J9wnfTfjJYqS_jQ",
  authDomain: "ai-cookbook-db19d.firebaseapp.com",
  projectId: "ai-cookbook-db19d",
  storageBucket: "ai-cookbook-db19d.firebasestorage.app",
  messagingSenderId: "373818202101",
  appId: "1:373818202101:web:3118a257b2b52a5671b2bc",
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Export `app` and any services you want to reuse
export { app, getFirestore };
