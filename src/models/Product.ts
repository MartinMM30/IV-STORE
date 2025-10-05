import mongoose, { Schema, model, models } from "mongoose";

// Interfaz TypeScript
export interface IProduct {
  _id?: string;           // Mongo lo añade
  name: string;
  price: number;
  stock: number;
  description?: string;
  images?: string[];
  category?: string;
  createdAt?: Date;
}

// Esquema Mongoose
const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    description: { type: String },
    images: [{ type: String }],
    category: { type: String, default: "general" },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true, // 👉 añade createdAt y updatedAt automáticamente
  }
);

// ✅ Previene recompilar el modelo en Hot Reload (Next.js)
export const Product = models.Product || model<IProduct>("Product", ProductSchema);
