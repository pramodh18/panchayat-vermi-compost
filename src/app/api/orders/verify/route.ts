import { NextRequest } from "next/server";
import { fulfillPaidOrder } from "@/lib/orders/fulfill-payment";
import { verifyPaymentSchema } from "@/lib/validation";
import { jsonError, jsonOk, parseJsonBody } from "@/lib/api-response";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = rateLimit(`order-verify:${ip}`, { limit: 20, windowMs: 60_000 });
  if (!limit.allowed) {
    return jsonError("Too many requests. Please try again later.", 429);
  }

  const body = await parseJsonBody<unknown>(request);
  const parsed = verifyPaymentSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Invalid payment data", 400);
  }

  const result = await fulfillPaidOrder(parsed.data);

  if (!result.ok) {
    return jsonError(result.error, result.status);
  }

  return jsonOk({ orderId: result.order.id });
}
