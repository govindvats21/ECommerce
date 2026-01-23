// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
 apiKey:import.meta.env.VITE_FIREBASE_KEY ,
  authDomain: "vats-31b80.firebaseapp.com",
  projectId: "vats-31b80",
  storageBucket: "vats-31b80.firebasestorage.app",
  messagingSenderId: "418875225852",
  appId: "1:418875225852:web:997c48a02b1138a89d0979"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider()

export {auth,provider}