// src/lib/mongoClient.ts

import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI as string;

if (!uri) {
  // Asegúrate de que este error sea fácil de ver
  throw new Error("❌ Falta MONGODB_URI en .env.local");
}

// 1. Definir variables globales para el caching
// TypeScript no tiene una variable global nativa, pero la podemos extender si es necesario.
// Usaremos 'global' o 'globalThis' con un tipo que aseguramos.
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let clientPromise: Promise<MongoClient>;

// 2. Lógica de Caching
if (process.env.NODE_ENV === "development") {
  // En desarrollo, usamos una variable global (globalThis)
  // para mantener el cliente cacheado entre recargas del módulo.
  if (!global._mongoClientPromise) {
    console.log("--- Inicializando promesa de conexión a MongoDB ---");
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // En producción (o build), solo creamos la conexión una vez.
  clientPromise = client.connect();
}

/**
 * Función exportada que devuelve una promesa del cliente conectado.
 * Usa un mecanismo de caching que es seguro en modo desarrollo y en producción.
 */
export async function connectMongo() {
  const connectedClient = await clientPromise;
  
  // Opcional: una verificación de latido (ping) antes de devolverlo
  await connectedClient.db("admin").command({ ping: 1 });
  console.log("✅ Conexión a MongoDB (cliente cacheado/reutilizado)");

  return connectedClient;
}