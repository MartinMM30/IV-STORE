// app/api/admin/products/route.ts
import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongooseClient";
import { Product } from "@/models/Product";
import { checkAdmin } from "@/lib/apiMiddleware";

export async function GET(req: Request) {
    // Autentica y verifica que el usuario es admin
    const authCheck = await checkAdmin(req);
    if (authCheck.status !== 200) {
        return NextResponse.json({ message: authCheck.message }, { status: authCheck.status });
    }

    try {
        await connectMongoose();
        const products = await Product.find({});
        return NextResponse.json(products, { status: 200 });
    } catch (error) {
        console.error("Error al cargar productos de admin:", error);
        return NextResponse.json({ message: "Error interno" }, { status: 500 });
    }
}

// Este es un ejemplo para crear un producto, si lo necesitas
export async function POST(req: Request) {
    const authCheck = await checkAdmin(req);
    if (authCheck.status !== 200) {
        return NextResponse.json({ message: authCheck.message }, { status: authCheck.status });
    }

    try {
        const body = await req.json();
        await connectMongoose();
        const newProduct = await Product.create(body);
        return NextResponse.json({ message: "Producto creado", product: newProduct }, { status: 201 });
    } catch (error) {
        console.error("Error al crear producto:", error);
        return NextResponse.json({ message: "Error interno" }, { status: 500 });
    }
}