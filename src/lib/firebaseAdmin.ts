// src/lib/firebaseAdmin.ts
import admin from "firebase-admin";

if (!admin.apps.length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!privateKey) {
    console.error("❌ FALTA FIREBASE_PRIVATE_KEY en variables de entorno");
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // 🔥 Esta línea es la clave: corrige el formato en Vercel
        privateKey: privateKey?.replace(/\\n/g, "\n"),
      }),
    });

    console.log("✅ Firebase Admin inicializado correctamente");
  } catch (err) {
    console.error("❌ Error inicializando Firebase Admin:", err);
  }
}

export const adminApp = admin;
export { admin };
