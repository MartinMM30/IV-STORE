import "./globals.css";

import { AuthProvider } from "@/context/AuthContext";

// Importa CartProvider si aún lo tienes en tu estructura de context

import { CartProvider } from "@/context/CartContext";

import Navbar from "@/components/Navbar";

import Footer from "@/components/Footer";

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
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
