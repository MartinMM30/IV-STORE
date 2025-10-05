// testFirebase.ts
import * as admin from "firebase-admin";
import path from "path";

try {
  if (!admin.apps.length) {
    // Replace the placeholder with the actual file name
    const serviceAccountPath = path.resolve("./ecommerce-demo-firebase-adminsdk-12345.json");
    
    const serviceAccount = require(serviceAccountPath);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log("✅ Firebase Admin inicializado correctamente");
  }
} catch (err) {
  console.error("❌ Error inicializando Firebase Admin:", err);
  process.exit(1);
}
// Probar llamada simple a Firebase Auth
async function testFirebaseAuth() {
  try {
    const list = await admin.auth().listUsers(1);
    console.log("✅ Conexión exitosa a Firebase Auth. Usuarios encontrados:", list.users.length);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error probando Firebase Auth:", err);
    process.exit(1);
  }
}

testFirebaseAuth();