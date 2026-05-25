import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

export const onUserCreate = onDocumentCreated("users/{uid}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) return;

  const data = snapshot.data();
  
  // Set default role and status if not present
  if (!data.status) {
    await snapshot.ref.update({
      status: "RECRUIT",
      role: "recruit",
      createdAt: admin.firestore.Timestamp.now()
    });
    
    // Set custom claim to recruit
    await admin.auth().setCustomUserClaims(event.params.uid, {
      role: "recruit"
    });
  }
});

export const setUserRole = onCall(async (request) => {
  const callerAuth = request.auth;
  if (!callerAuth) {
    throw new HttpsError("unauthenticated", "User must be logged in.");
  }

  const callerRole = callerAuth.token.role;
  if (callerRole !== "board_lead" && callerRole !== "super_admin") {
    throw new HttpsError("permission-denied", "Unauthorized.");
  }

  const targetUid = request.data.uid;
  const newRole = request.data.role;

  if (!targetUid || !newRole) {
    throw new HttpsError("invalid-argument", "Missing uid or role.");
  }

  await admin.auth().setCustomUserClaims(targetUid, {
    role: newRole
  });

  await db.collection("users").doc(targetUid).update({
    role: newRole,
    updatedAt: admin.firestore.Timestamp.now()
  });

  return { success: true };
});
