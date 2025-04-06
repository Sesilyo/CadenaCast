import { db } from "./config";
import { collection, addDoc } from "firebase/firestore";

export const addUserData = async (userData) => {
  try {
    const docRef = await addDoc(collection(db, "users"), userData);
    console.log("Document written with ID: ", docRef.id);
    return docRef;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
};