// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDHPBxaZ0jOxyioZTE3xz6I1OphYDk_Eks",
  authDomain: "ollama-3ad19.firebaseapp.com",
  projectId: "ollama-3ad19",
  storageBucket: "ollama-3ad19.firebasestorage.app",
  messagingSenderId: "810361814926",
  appId: "1:810361814926:web:3e07055c8153fe223ceedf",
  measurementId: "G-7FK8R6MG7M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);