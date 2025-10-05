import * as admin from 'firebase-admin';

// Cargar variables de entorno del archivo .env.local
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Importamos la conexión Mongoose y el modelo User (asumiendo las rutas de assignAdminRole.ts)
import { connectMongoose } from "../src/lib/mongooseClient";
import { User } from "../src/models/User";

async function createAdminUser() {
    // Asegúrate de que el SDK de Firebase Admin esté inicializado.
    if (!admin.apps.length) {
        try {
            // Usar variables de entorno para las credenciales.
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    // La clave privada debe estar en una sola línea en el .env.local y con \n.
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                }),
            });
            console.log('✅ Firebase Admin inicializado correctamente.');
        } catch (err) {
            console.error('❌ Error inicializando Firebase Admin:', err);
            process.exit(1);
        }
    }

    // Leer el correo y la contraseña desde los argumentos de la línea de comandos
    const email = process.argv[2];
    const password = process.argv[3];

    if (!email || !password) {
        console.error('❌ Error: Por favor, proporciona un correo y una contraseña.');
        console.error('Uso: npx ts-node --project tsconfig.scripts.json scripts/createAdmin.ts <correo> <contraseña>');
        process.exit(1);
    }

    try {
        // 1. Crear el usuario en Firebase Authentication
        const userRecord = await admin.auth().createUser({
            email,
            password,
        });

        console.log(`✅ Usuario creado en Firebase Auth con ID: ${userRecord.uid}`);
        
        // 2. Crear el documento de usuario en MongoDB (Mongoose)
        await connectMongoose();

        const mongoUser = await User.create({
            uid: userRecord.uid,
            email: email,
            role: 'admin', // Establecer el rol directamente en el documento de Mongo
        });

        console.log(`✅ Documento de usuario creado en MongoDB con rol: ${mongoUser.role}`);

        // 3. Asignar el rol de 'admin' con un custom claim (para seguridad de Firebase)
        await admin.auth().setCustomUserClaims(userRecord.uid, { role: 'admin' });

        console.log(`✅ Custom Claim 'admin' establecido para Firebase Auth.`);
        console.log(`🎉 ¡Usuario administrador creado exitosamente! Correo: ${email}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creando el usuario administrador:', error);
        process.exit(1);
    }
}

createAdminUser();
