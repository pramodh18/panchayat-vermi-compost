import Razorpay from "razorpay";
import crypto from "crypto";
import { safeEqual } from "@/lib/crypto";

function getRazorpayClient(): Razorpay {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials are not configured");
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

export async function createRazorpayOrder(params: {
  amountPaise: number;
  receipt: string;
  notes?: Record<string, string>;
}) {
  if (params.amountPaise < 100) {
    throw new Error("Minimum order amount is ₹1");
  }

  const razorpay = getRazorpayClient();

  return razorpay.orders.create({
    amount: params.amountPaise,
    currency: "INR",
    receipt: params.receipt,
    notes: params.notes,
  });
}

export function verifyPaymentSignature(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;

  const body = `${params.razorpayOrderId}|${params.razorpayPaymentId}`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  return safeEqual(expected, params.razorpaySignature);
}

/** Verify Razorpay webhook `X-Razorpay-Signature` header. */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  return safeEqual(expected, signature);
}

export interface RazorpayPaymentEntity {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: string;
}

export async function fetchRazorpayPayment(
  paymentId: string
): Promise<RazorpayPaymentEntity> {
  const razorpay = getRazorpayClient();
  const payment = await razorpay.payments.fetch(paymentId);
  return payment as RazorpayPaymentEntity;
}

export function getRazorpayKeyId(): string {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? process.env.RAZORPAY_KEY_ID;
  if (!keyId) {
    throw new Error("Razorpay key ID is not configured");
  }
  return keyId;
}
