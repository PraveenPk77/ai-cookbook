import { getFirestore, collection, addDoc } from "firebase/firestore";
import { app } from "./firebase"; // ✅ now this will work

const db = getFirestore(app);

export async function saveRecipeToFirestore(data: any) {
  try {
    const cleanData = JSON.parse(JSON.stringify(data));
    const docRef = await addDoc(collection(db, "recipes"), cleanData);
    console.log("Document written with ID:", docRef.id);
    return docRef.id;
  } catch (err) {
    console.error("Error saving to Firestore:", err);
    throw err;
  }
}
