import mongoose, { Schema, model, models, Document } from "mongoose";

// Interfaz para los ítems del carrito
export interface ICartItem {
  productId: string; // Usamos string para el ID de producto
  name: string;
  quantity: number;
  price: number;
}

// Interfaz para el documento del Carrito completo
export interface ICart extends Document {
  userId: string; // UID del usuario de Firebase/Auth
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

// Esquema de Mongoose para un solo ítem del carrito
const CartItemSchema: Schema = new Schema<ICartItem>({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
}); // No necesitamos un ID para cada subdocumento

// Esquema principal del Carrito
const CartSchema: Schema = new Schema<ICart>(
  {
    userId: {
      type: String,
      required: true,
      unique: true, // Cada usuario solo puede tener un carrito
      index: true,
    },
    items: { type: [CartItemSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

// Define o usa el modelo existente
export const Cart = models.Cart || model<ICart>("Cart", CartSchema);
