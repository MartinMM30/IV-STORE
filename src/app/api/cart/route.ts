import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongooseClient";
import { Cart } from "@/models/Cart";
import { checkAuth } from "@/lib/checkAuth";

// GET: Cargar el carrito del usuario logueado desde la base de datos
export async function GET(req: Request) {
  const authCheck = await checkAuth(req);
  if (authCheck.status !== 200) {
    return NextResponse.json(
      { message: authCheck.message || "No autorizado" },
      { status: authCheck.status }
    );
  }

  const userId = authCheck.uid as string;

  try {
    await connectMongoose();

    const cart = await Cart.findOne({ userId });

    if (!cart) {
  return NextResponse.json({ items: [] }, { status: 200 });
}
const normalizedItems = cart.items.map((item: any) => ({
  _id: item.productId, // ← devolvemos como _id
  name: item.name,
  quantity: item.quantity,
  price: item.price,
}));

   
return NextResponse.json({ items: normalizedItems }, { status: 200 });
  } catch (error) {
    console.error("❌ Error al cargar carrito:", error);
    return NextResponse.json(
      { message: "Error interno al cargar el carrito" },
      { status: 500 }
    );
  }
}

// PUT: Guardar o actualizar el carrito del usuario logueado en la base de datos
export async function PUT(req: Request) {
    console.log("🧩 Headers recibidos:", req.headers.get("authorization"));

  const authCheck = await checkAuth(req);
  const authResult = await checkAuth(req);
console.log("🧩 Resultado de autenticación:", authResult);

  if (authCheck.status !== 200) {
    return NextResponse.json(
      { message: authCheck.message || "No autorizado" },
      { status: authCheck.status }
    );
  }

  const userId = authCheck.uid as string;

  try {
    const body = await req.json();
    let { items } = body;

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { message: "Datos de carrito no válidos" },
        { status: 400 }
      );
    }
    console.log("🧩 Items recibidos:", JSON.stringify(items, null, 2));


    // ✅ Normalizar productos para coincidir con el esquema de Mongoose
  items = items.map((item: any) => ({
  productId: item.productId || item._id, // siempre llenamos productId
  name: item.name,
  quantity: item.quantity,
  price: item.price,
}));

    await connectMongoose();

    const update = { userId, items, updatedAt: new Date() };
    const options = {
      upsert: true,
      new: true,
      runValidators: true,
    };

    const updatedCart = await Cart.findOneAndUpdate({ userId }, update, options);

    if (!updatedCart) {
      throw new Error("No se pudo guardar el carrito en la base de datos");
    }

    return NextResponse.json(
      { message: "✅ Carrito guardado exitosamente", cartId: updatedCart._id },
      { status: 200 }
    );
  } catch (error) {
  console.error("Error al guardar carrito:", error);
  return NextResponse.json(
    { 
      message: "Error interno al guardar el carrito", 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : null
    },
    { status: 500 }
  );
}
}