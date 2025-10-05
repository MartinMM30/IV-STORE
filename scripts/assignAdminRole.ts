import * as admin from 'firebase-admin';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' }); // Carga las credenciales de Firebase Admin

import { connectMongoose } from "../src/lib/mongooseClient";
import { User } from "../src/models/User";

/**
 * Inicializa el SDK de Firebase Admin si no ha sido inicializado.
 */
const initializeAdmin = () => {
    if (!admin.apps.length) {
        try {
            // Usa las credenciales cargadas desde .env.local
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                }),
            });
            console.log('✅ Firebase Admin inicializado correctamente.');
        } catch (err) {
            console.error('❌ Error inicializando Firebase Admin:', err);
            process.exit(1);
        }
    }
}

/**
 * Asigna el rol 'admin' a un usuario existente, actualizando tanto Firebase Custom Claims
 * como el documento de Mongoose.
 */
const assignAdminRole = async (email: string) => {
    try {
        initializeAdmin();

        // 1. Conectar a MongoDB
        await connectMongoose();

        // 2. Encontrar el usuario en Firebase Auth para obtener el UID
        const userRecord = await admin.auth().getUserByEmail(email);
        const uid = userRecord.uid;
        console.log(`✅ Usuario encontrado en Firebase Auth con ID: ${uid}`);

        // 3. Asignar el rol de 'admin' con un custom claim en Firebase
        await admin.auth().setCustomUserClaims(uid, { role: 'admin' });
        console.log(`✅ Custom Claim 'admin' establecido para Firebase Auth.`);

        // 4. Actualizar el documento de usuario en MongoDB
        const mongoUser = await User.findOneAndUpdate(
            { email: email },
            { $set: { role: "admin" } },
            { new: true }
        );

        if (mongoUser) {
            console.log(`✅ Rol 'admin' asignado en MongoDB.`);
            console.log(`🎉 ¡Rol de administrador asignado exitosamente a ${email}!`);
        } else {
            console.log(`⚠️ Advertencia: El usuario existe en Firebase Auth, pero no se encontró un documento en MongoDB con el email ${email}.`);
            console.log(`Se estableció el custom claim de Firebase, pero la base de datos de Mongo no fue actualizada. (Asegúrate de que el proceso de registro guarda el usuario en Mongo)`);
        }
        process.exit(0);

    } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
            console.error(`❌ Error: No se encontró un usuario de Firebase Auth con el email ${email}.`);
        } else {
            console.error("❌ Error al asignar el rol de administrador:", error);
        }
        process.exit(1);
    }
};

const email = process.argv[2];
if (!email) {
    console.error("❌ Por favor, proporciona un email para asignar el rol de admin.");
    console.error('Uso: npx ts-node --project tsconfig.scripts.json scripts/assignAdminRole.ts <correo>');
    process.exit(1);
}

assignAdminRole(email);
