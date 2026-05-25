import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "./client";

const ALLOWED_DOMAINS = ["srmist.edu.in", "nexttechlab.in"];

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  // Enforce domain selection at Google UI level
  provider.setCustomParameters({ hd: ALLOWED_DOMAINS[0] });

  try {
    const result = await signInWithPopup(auth, provider);
    const email = result.user.email ?? "";
    const domain = email.split("@")[1];

    if (!ALLOWED_DOMAINS.includes(domain)) {
      await signOut(auth);
      throw new Error("ACCESS_DENIED: NTL Board Clearance Required (Use an @srmist.edu.in or @nexttechlab.in email)");
    }

    return result.user;
  } catch (error: any) {
    throw new Error(error.message || "Failed to authenticate.");
  }
}

export async function logoutUser() {
  await signOut(auth);
}
