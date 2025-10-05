// src/lib/mongooseClient.ts
import mongoose from 'mongoose';
import 'dotenv/config';

const MONGO_URI = process.env.MONGODB_URI as string;

if (!MONGO_URI) {
  throw new Error('❌ Falta MONGODB_URI en .env.local');
}

declare global {
  // Para evitar errores de redefinición en hot reload de Next.js
  // eslint-disable-next-line no-var
  var mongooseCache: {
    conn: mongoose.Mongoose | null;
    promise: Promise<mongoose.Mongoose> | null;
  };
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

export async function connectMongoose() {
  if (cached.conn) {
    console.log('✅ Conexión a MongoDB (cliente cacheado/reutilizado)');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = { bufferCommands: false };

    cached.promise = mongoose.connect(MONGO_URI, opts);
    console.log('--- Inicializando promesa de conexión a MongoDB ---');
  }

  try {
    cached.conn = await cached.promise;
    console.log('✅ Conexión a MongoDB (nueva conexión)');
  } catch (e) {
    cached.promise = null;
    console.error('❌ Error de conexión a MongoDB:', e);
    throw e;
  }

  return cached.conn;
}

export default connectMongoose;
