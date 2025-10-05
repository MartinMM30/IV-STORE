// lib/apiMiddleware.ts

import { NextResponse } from "next/server";
import { admin } from "./firebaseAdmin"; // Tu SDK de Firebase Admin

export const checkAdmin = async (req: Request) => {
  try {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return { status: 401, message: "Unauthorized: No token provided." };
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    const isAdmin = decodedToken.role === "admin";

    if (!isAdmin) {
      return { status: 403, message: "Forbidden: Not an admin." };
    }

    return { status: 200, uid: decodedToken.uid };

  } catch (error) {
    console.error("Authentication error:", error);
    return { status: 401, message: "Invalid token." };
  }
};