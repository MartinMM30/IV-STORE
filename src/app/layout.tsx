import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SlimeAssistant from "../components/slime/SlimeAssistant"; // <-- 1. AÑADE ESTA LÍNEA DE IMPORTACIÓN

export const metadata = {
  title: "IV Design",
  description: "E-commerce demo con Next.js y Tailwind",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="flex flex-col min-h-screen">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-6">
              {children}
            </main>
            <Footer />
            <SlimeAssistant /> {/* Es mejor ponerlo aquí al final del body */}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
