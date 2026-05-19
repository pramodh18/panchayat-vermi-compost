import { NextRequest } from "next/server";
import { fulfillByRazorpayOrderId } from "@/lib/orders/fulfill-payment";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { jsonError, jsonOk } from "@/lib/api-response";

export const runtime = "nodejs";

interface RazorpayWebhookPayload {
  event: string;
  payload?: {
    payment?: {
      entity?: {
        id: string;
        order_id: string;
        status: string;
      };
    };
  };
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get("x-razorpay-signature");
  if (!signature) {
    return jsonError("Missing signature", 400);
  }

  const rawBody = await request.text();

  if (!verifyWebhookSignature(rawBody, signature)) {
    return jsonError("Invalid webhook signature", 401);
  }

  let payload: RazorpayWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as RazorpayWebhookPayload;
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  if (payload.event !== "payment.captured" && payload.event !== "payment.authorized") {
    return jsonOk({ received: true, skipped: true });
  }

  const payment = payload.payload?.payment?.entity;
  if (!payment?.id || !payment.order_id) {
    return jsonError("Invalid payment payload", 400);
  }

  const result = await fulfillByRazorpayOrderId({
    razorpayOrderId: payment.order_id,
    razorpayPaymentId: payment.id,
  });

  if (!result.ok) {
    // Return 200 for idempotent/already-processed cases to stop Razorpay retries
    if (result.status === 409 || result.status === 404) {
      return jsonOk({ received: true, warning: result.error });
    }
    console.error("Webhook fulfillment failed:", result.error);
    return jsonError(result.error, result.status);
  }

  return jsonOk({ received: true, orderId: result.order.id });
}
