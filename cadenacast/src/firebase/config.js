import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyARAZIOFSKWTYDnb3E3OO8U1jIeMuoj-CA",
  authDomain: "testthon-5b972.firebaseapp.com",
  databaseURL: "https://testthon-5b972-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "testthon-5b972",
  storageBucket: "testthon-5b972.appspot.com",
  messagingSenderId: "412241224515",
  appId: "1:412241224515:web:2fcab1a4a77f9d5c3f05f6",
  measurementId: "G-EX0QHTY41J"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);