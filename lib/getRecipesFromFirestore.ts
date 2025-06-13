import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { app } from "./firebase";

const db = getFirestore(app);

export async function getRecipesFromFirestore() {
  const recipesRef = collection(db, "recipes");
  const q = query(recipesRef, orderBy("createdAt", "desc"));

  const snapshot = await getDocs(q);
  const recipes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  return recipes;
}
