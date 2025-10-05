import * as admin from "firebase-admin";

// ⚠️ No uses dotenv en producción de Vercel (ya carga automáticamente las env)
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!admin.apps.length) {
  if (!projectId || !clientEmail || !privateKey) {
    console.error("❌ Faltan variables de entorno de Firebase Admin");
  } else {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      console.log("✅ Firebase Admin inicializado correctamente");
    } catch (error) {
      console.error("❌ Error inicializando Firebase Admin:", error);
    }
  }
}

export { admin };
