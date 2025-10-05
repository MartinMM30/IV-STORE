import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export const loginAndSetToken = async (email: string, password: string) => {
  const userCred = await signInWithEmailAndPassword(auth, email, password);
  const token = await userCred.user.getIdToken();

  // Guardar token en cookies (para middleware)
  document.cookie = `token=${token}; path=/;`;
};

export const logoutAndClearToken = async () => {
  document.cookie = "token=; Max-Age=0; path=/;";
};
