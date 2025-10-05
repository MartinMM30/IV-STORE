// lib/resend.ts

import { Resend } from "resend";

// Inicializa la instancia de Resend una sola vez
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Envía un correo electrónico usando la API de Resend.
 * @param {string} to - Destinatario del correo.
 * @param {string} subject - Asunto del correo.
 * @param {string} html - Contenido del correo en formato HTML.
 * @returns {Promise<object>} El resultado de la operación de envío.
 */
export const sendEmail = async ({ to, subject, html }: { to: string, subject: string, html: string }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Tu Tienda <onboarding@resend.dev>', // Tu dominio verificado
      to: [to],
      subject,
      html,
    });

    if (error) {
      throw new Error(error.message);
    }

    console.log("✅ Correo enviado con éxito:", data);
    return data;
  } catch (error) {
    console.error("❌ Error al enviar correo:", error);
    throw error;
  }
};