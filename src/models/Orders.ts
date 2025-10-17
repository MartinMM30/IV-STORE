import mongoose, { Schema, model, models, Document } from "mongoose";

// Interfaz para el producto dentro de la orden
export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
}

// Interfaz para la dirección de envío
export interface IShippingAddress {
  name: string;
  email: string;
  address: string;
  city: string;
  country: string;
  zipCode: string;
}

// Interfaz para el documento de la orden
export interface IOrder extends Document {
  userId?: string;
  guestInfo?: { name: string; email: string };
  orderItems: IOrderItem[];
  shippingAddress: IShippingAddress;
  totalPrice: number;
  status: "pendiente" | "pagado" | "enviado" | "entregado" | "cancelado";
  // ✅ CAMBIO: Añadimos el campo para guardar la referencia del pago de Stripe
  paymentIntentId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Esquema de Mongoose para el producto en la orden
const OrderItemSchema: Schema = new Schema<IOrderItem>({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

// Esquema de Mongoose para la dirección de envío
const ShippingAddressSchema: Schema = new Schema<IShippingAddress>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  zipCode: { type: String, required: true },
});

// Esquema principal de la orden
const OrderSchema: Schema = new Schema<IOrder>(
  {
    userId: { type: String, default: null },
    guestInfo: {
      name: { type: String },
      email: { type: String },
    },
    orderItems: { type: [OrderItemSchema], required: true },
    shippingAddress: { type: ShippingAddressSchema, required: true },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pendiente", "pagado", "enviado", "entregado", "cancelado"],
      default: "pendiente",
    },
    // ✅ CAMBIO: Añadimos el campo al esquema de la base de datos
    paymentIntentId: { type: String, unique: true },
  },
  {
    timestamps: true,
  }
);

export const Order = models.Order || model<IOrder>("Order", OrderSchema);
