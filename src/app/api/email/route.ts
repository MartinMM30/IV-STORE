// app/api/email/route.ts

import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/resend"; // Importa la nueva librería

// Opcional: crea tu plantilla HTML aquí o en un componente de React aparte
const createEmailHtml = (orderId: string, items: any[], totalAmount: number) => {
  const orderSummaryHtml = items.map((item: any) => `
    <tr>
      <td>${item.name}</td>
      <td style="text-align: right;">${item.quantity}</td>
      <td style="text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px;">
      <h2 style="text-align: center; color: #333;">Confirmación de Pedido</h2>
      <hr style="border: none; border-top: 1px solid #eee;">
      <p>¡Gracias por tu compra! Tu pedido ha sido confirmado.</p>
      <p><strong>Número de Pedido:</strong> #${orderId.substring(0, 8)}</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr style="background-color: #f4f4f4;">
            <th style="padding: 10px; text-align: left;">Producto</th>
            <th style="padding: 10px; text-align: right;">Cantidad</th>
            <th style="padding: 10px; text-align: right;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${orderSummaryHtml}
        </tbody>
        <tfoot>
          <tr style="border-top: 2px solid #333;">
            <td colspan="2" style="padding: 10px; text-align: right;"><strong>Total:</strong></td>
            <td style="padding: 10px; text-align: right;"><strong>$${totalAmount.toFixed(2)}</strong></td>
          </tr>
        </tfoot>
      </table>
      <p style="text-align: center; margin-top: 40px; color: #777;">Si tienes alguna pregunta, no dudes en contactarnos.</p>
    </div>
  `;
};
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, recipientEmail, items, totalAmount } = body;

    // ... (validaciones)

    const emailHtml = createEmailHtml(orderId, items, totalAmount);

    // Usa la función de la librería
    await sendEmail({
      to: recipientEmail,
      subject: `Confirmación de Pedido #${orderId.substring(0, 8)}`,
      html: emailHtml,
    });

    return NextResponse.json(
      { message: "Correo de confirmación enviado con éxito." },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error en la API de Correo:", error);
    return NextResponse.json(
      { error: "Error interno al procesar el envío de correo." },
      { status: 500 }
    );
  }
}