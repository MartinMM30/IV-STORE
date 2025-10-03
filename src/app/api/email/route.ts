import { NextResponse } from 'next/server';

/**
 * @name POST /api/email
 * @description API endpoint para simular el envío de un email de confirmación de orden.
 * * En un entorno real, aquí se integraría un servicio como SendGrid, Nodemailer o Postmark.
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        // -------------------------------------------------------------
        // TODO: INTEGRAR SENDGRID / POSTMARK AQUÍ (Reemplazar la simulación)
        // -------------------------------------------------------------
        
        // ** SIMULACIÓN DEL ENVÍO **
        // Esta sección imprime los datos del pedido en la consola del servidor (Node.js)
        console.log("-----------------------------------------");
        console.log("📧 SIMULACIÓN: Email de Confirmación Enviado");
        
        // CORRECCIÓN 1: Manejamos undefined para email y usamos un valor por defecto.
        const recipientEmail = body.shippingAddress?.email || 'email-no-proporcionado@ejemplo.com';
        console.log(`Destinatario: ${recipientEmail}`);
        
        // CORRECCIÓN 2: Manejamos undefined para totalPrice (siempre 0 si falta).
        const orderTotal = body.totalPrice || 0;
        console.log(`Total: $${orderTotal.toFixed(2)}`);
        
        // CORRECCIÓN 3: Manejamos undefined para orderItems (siempre array vacío si falta), previniendo el error .map().
        const itemsList = (body.orderItems || []).map(
            (item: any) => `${item.name} x${item.quantity}`
        ).join(', ');
        
        console.log(`Número de Orden: ${body.orderId}`);
        console.log(`Detalles del pedido: ${itemsList}`);
        console.log("-----------------------------------------");

        // Simula un retraso de 500ms como si estuviera llamando a un servicio externo.
        await new Promise(resolve => setTimeout(resolve, 500));

        // Si la simulación es exitosa (código 200), retorna una respuesta positiva
        return NextResponse.json({ 
            success: true, 
            message: "Email de confirmación simulado enviado con éxito.",
            orderId: body.orderId
        }, { status: 200 });

    } catch (error) {
        console.error("Error al simular el envío de email:", error);
        // Devolvemos 500 solo si el error es grave y no se pudo procesar la solicitud.
        return NextResponse.json({ 
            success: false, 
            message: "Fallo interno en la API de simulación de email.",
            error: (error as Error).message
        }, { status: 500 });
    }
}