// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_KEY,
  authDomain: "e-commerce-f37d6.firebaseapp.com",
  projectId: "e-commerce-f37d6",
  storageBucket: "e-commerce-f37d6.firebasestorage.app",
  messagingSenderId: "898731143842",
  appId: "1:898731143842:web:853f5f8025e5637a809dfb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider()

export {auth,provider}