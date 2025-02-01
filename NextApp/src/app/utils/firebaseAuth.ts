import { signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "./firebaseConfig";

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

export const getCurrentUserToken = async () => {
  try {
    return await auth.currentUser?.getIdToken();
  } catch (error) {
    console.error("Error getting user token:", error);
    return null;
  }
};