// src/models/User.ts
// src/models/User.ts
import mongoose, { Schema, model, models } from "mongoose";

export interface IUser {
  uid: string;
  email: string;
  nombre?: string;
  role: string;
  createdAt?: Date;
  edad?: number;
  ciudad?: string;
  pais?: string;
  telefono?: string;
}

const UserSchema = new Schema<IUser>({
  uid: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  nombre: { type: String },
  role: { type: String, default: "user" },
  edad: { type: Number },
  ciudad: { type: String },
  pais: { type: String },
  telefono: { type: String },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

export const User = models.User || model<IUser>("User", UserSchema);