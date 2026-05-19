import { Resend } from "resend";
import type { Order } from "@prisma/client";
import { PANCHAYAT_NAME } from "./constants";

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function formatOrderDetails(order: Order): string {
  return `
Order ID: ${order.id}
Customer: ${order.customerName}
Phone: ${order.phoneNumber}
Address: ${order.address}
Quantity: ${order.quantityKg} kg
Total: ₹${order.totalAmount}
Payment Status: ${order.paymentStatus}
  `.trim();
}

export async function sendCustomerConfirmation(order: Order): Promise<void> {
  const resend = getResend();
  const customerEmail = process.env.CUSTOMER_NOTIFICATION_EMAIL;

  if (!resend || !customerEmail) {
    console.warn("Resend or CUSTOMER_NOTIFICATION_EMAIL not configured; skipping customer email");
    return;
  }

  const from = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

  await resend.emails.send({
    from,
    to: customerEmail,
    subject: `Order Confirmed - ${PANCHAYAT_NAME} Vermi Compost`,
    text: `Dear ${order.customerName},

Thank you for your order of ${order.quantityKg} kg vermi compost.

${formatOrderDetails(order)}

We will contact you at ${order.phoneNumber} for delivery.

— ${PANCHAYAT_NAME}`,
  });
}

export async function sendAdminNotification(order: Order): Promise<void> {
  const resend = getResend();
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;

  if (!resend || !adminEmail) {
    console.warn("Resend or ADMIN_NOTIFICATION_EMAIL not configured; skipping admin email");
    return;
  }

  const from = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

  await resend.emails.send({
    from,
    to: adminEmail,
    subject: `New Paid Order - ${order.customerName}`,
    text: `A new vermi compost order has been paid.

${formatOrderDetails(order)}

Customer phone for WhatsApp: ${order.phoneNumber}`,
  });
}

/**
 * WhatsApp notifications require a Business API provider (e.g. Twilio, Meta).
 * This logs the message for MVP; wire your provider in production.
 */
export async function logWhatsAppNotifications(order: Order): Promise<void> {
  const customerMessage = `Order confirmed: ${order.quantityKg} kg vermi compost, ₹${order.totalAmount}. Order ID: ${order.id}`;
  const adminMessage = `New order from ${order.customerName} (${order.phoneNumber}): ${order.quantityKg} kg, ₹${order.totalAmount}`;

  console.info("[WhatsApp stub - customer]", order.phoneNumber, customerMessage);
  console.info("[WhatsApp stub - admin]", process.env.ADMIN_WHATSAPP_NUMBER, adminMessage);
}
