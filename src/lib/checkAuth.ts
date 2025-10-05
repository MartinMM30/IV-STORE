import { admin } from "./firebaseAdmin";

export const checkAuth = async (req: Request) => {
  try {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return { status: 401, message: "No token provided" };
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    return {
      status: 200,
      uid: decodedToken.uid,
      role: decodedToken.role || "user",
    };
  } catch (error) {
    console.error("Auth verification failed:", error);
    return { status: 401, message: "Invalid or expired token" };
  }
};
