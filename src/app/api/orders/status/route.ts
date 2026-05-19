import { NextRequest } from "next/server";
import { updateOrderStatus } from "@/lib/orders/update-status";
import { orderStatusSchema } from "@/lib/validation";
import { jsonError, jsonOk, parseJsonBody } from "@/lib/api-response";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const bodySchema = orderStatusSchema.extend({
  status: z.enum(["CANCELLED", "FAILED"]),
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = rateLimit(`order-status:${ip}`, { limit: 30, windowMs: 60_000 });
  if (!limit.allowed) {
    return jsonError("Too many requests", 429);
  }

  const body = await parseJsonBody<unknown>(request);
  const parsed = bodySchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Invalid request", 400);
  }

  const updated = await updateOrderStatus({
    orderId: parsed.data.orderId,
    checkoutToken: parsed.data.checkoutToken,
    nextStatus: parsed.data.status,
  });

  if (!updated) {
    return jsonError("Unable to update order", 400);
  }

  return jsonOk({});
}
