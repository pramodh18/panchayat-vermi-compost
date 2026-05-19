import type { Order } from "@prisma/client";
import { amountInPaise } from "@/lib/constants";
import { prisma } from "@/lib/db";
import {
  sendAdminNotification,
  sendCustomerConfirmation,
  logWhatsAppNotifications,
} from "@/lib/email";
import {
  fetchRazorpayPayment,
  verifyPaymentSignature,
} from "@/lib/razorpay";

export type FulfillResult =
  | { ok: true; order: Order; alreadyPaid: boolean }
  | { ok: false; error: string; status: number };

const CAPTURED_STATUSES = new Set(["captured", "authorized"]);

/**
 * Idempotent payment fulfillment: signature check, Razorpay API verification,
 * amount match, and atomic DB update (PENDING → PAID only once).
 */
export async function fulfillPaidOrder(params: {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): Promise<FulfillResult> {
  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = params;

  if (!verifyPaymentSignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature })) {
    await prisma.order.updateMany({
      where: { id: orderId, paymentStatus: "PENDING" },
      data: { paymentStatus: "FAILED" },
    });
    return { ok: false, error: "Invalid payment signature", status: 400 };
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });

  if (!order) {
    return { ok: false, error: "Order not found", status: 404 };
  }

  if (order.razorpayOrderId !== razorpayOrderId) {
    return { ok: false, error: "Order mismatch", status: 400 };
  }

  // Idempotent: same payment already recorded
  if (
    order.paymentStatus === "PAID" &&
    order.razorpayPaymentId === razorpayPaymentId
  ) {
    return { ok: true, order, alreadyPaid: true };
  }

  if (order.paymentStatus !== "PENDING") {
    return { ok: false, error: "Order is not payable", status: 409 };
  }

  let payment;
  try {
    payment = await fetchRazorpayPayment(razorpayPaymentId);
  } catch {
    return { ok: false, error: "Could not verify payment with Razorpay", status: 502 };
  }

  if (payment.order_id !== razorpayOrderId) {
    return { ok: false, error: "Payment does not belong to this order", status: 400 };
  }

  if (!CAPTURED_STATUSES.has(payment.status)) {
    return { ok: false, error: "Payment not completed", status: 400 };
  }

  const expectedPaise = amountInPaise(order.totalAmount);
  if (payment.amount !== expectedPaise) {
    console.error(
      `Amount mismatch for order ${orderId}: expected ${expectedPaise}, got ${payment.amount}`
    );
    return { ok: false, error: "Payment amount mismatch", status: 400 };
  }

  if (payment.currency !== "INR") {
    return { ok: false, error: "Invalid payment currency", status: 400 };
  }

  const updated = await prisma.order.updateMany({
    where: {
      id: orderId,
      paymentStatus: "PENDING",
      razorpayOrderId,
    },
    data: {
      paymentStatus: "PAID",
      razorpayPaymentId,
    },
  });

  if (updated.count === 0) {
    const current = await prisma.order.findUnique({ where: { id: orderId } });
    if (
      current?.paymentStatus === "PAID" &&
      current.razorpayPaymentId === razorpayPaymentId
    ) {
      return { ok: true, order: current, alreadyPaid: true };
    }
    return { ok: false, error: "Order could not be updated", status: 409 };
  }

  const paidOrder = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });

  await Promise.allSettled([
    sendCustomerConfirmation(paidOrder),
    sendAdminNotification(paidOrder),
    logWhatsAppNotifications(paidOrder),
  ]);

  return { ok: true, order: paidOrder, alreadyPaid: false };
}

/**
 * Webhook path: Razorpay signature already verified on the raw body.
 * Fetches payment from API and atomically marks order PAID.
 */
export async function fulfillByRazorpayOrderId(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
}): Promise<FulfillResult> {
  const order = await prisma.order.findUnique({
    where: { razorpayOrderId: params.razorpayOrderId },
  });

  if (!order) {
    return { ok: false, error: "Order not found", status: 404 };
  }

  if (
    order.paymentStatus === "PAID" &&
    order.razorpayPaymentId === params.razorpayPaymentId
  ) {
    return { ok: true, order, alreadyPaid: true };
  }

  if (order.paymentStatus !== "PENDING") {
    return { ok: false, error: "Order is not payable", status: 409 };
  }

  let payment;
  try {
    payment = await fetchRazorpayPayment(params.razorpayPaymentId);
  } catch {
    return { ok: false, error: "Could not verify payment with Razorpay", status: 502 };
  }

  if (payment.order_id !== params.razorpayOrderId) {
    return { ok: false, error: "Payment order mismatch", status: 400 };
  }

  if (!CAPTURED_STATUSES.has(payment.status)) {
    return { ok: false, error: "Payment not completed", status: 400 };
  }

  const expectedPaise = amountInPaise(order.totalAmount);
  if (payment.amount !== expectedPaise || payment.currency !== "INR") {
    return { ok: false, error: "Payment amount mismatch", status: 400 };
  }

  const updated = await prisma.order.updateMany({
    where: {
      id: order.id,
      paymentStatus: "PENDING",
      razorpayOrderId: params.razorpayOrderId,
    },
    data: {
      paymentStatus: "PAID",
      razorpayPaymentId: params.razorpayPaymentId,
    },
  });

  if (updated.count === 0) {
    const current = await prisma.order.findUnique({ where: { id: order.id } });
    if (current?.paymentStatus === "PAID") {
      return { ok: true, order: current, alreadyPaid: true };
    }
    return { ok: false, error: "Order could not be updated", status: 409 };
  }

  const paidOrder = await prisma.order.findUniqueOrThrow({ where: { id: order.id } });

  await Promise.allSettled([
    sendCustomerConfirmation(paidOrder),
    sendAdminNotification(paidOrder),
    logWhatsAppNotifications(paidOrder),
  ]);

  return { ok: true, order: paidOrder, alreadyPaid: false };
}
