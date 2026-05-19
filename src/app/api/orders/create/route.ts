import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { amountInPaise } from "@/lib/constants";
import { generateCheckoutToken } from "@/lib/crypto";
import { createRazorpayOrder, getRazorpayKeyId } from "@/lib/razorpay";
import { buildOrderTotals, orderFormSchema, parseQuantityKg } from "@/lib/validation";
import { jsonError, jsonOk, parseJsonBody, zodFieldErrors } from "@/lib/api-response";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = rateLimit(`order-create:${ip}`, { limit: 10, windowMs: 60_000 });
  if (!limit.allowed) {
    return jsonError("Too many requests. Please try again later.", 429);
  }

  const body = await parseJsonBody<Record<string, unknown>>(request);
  if (!body) return jsonError("Invalid request body", 400);

  const parsed = orderFormSchema.safeParse({
    ...body,
    quantityKg: parseQuantityKg(body.quantityKg),
  });

  if (!parsed.success) {
    return jsonError("Validation failed", 400, {
      fieldErrors: zodFieldErrors(parsed.error),
    });
  }

  const { customerName, phoneNumber, address, quantityKg } = parsed.data;
  const { pricePerKg, totalAmount } = buildOrderTotals(quantityKg);
  const checkoutToken = generateCheckoutToken();

  let orderId: string | undefined;

  try {
    const order = await prisma.order.create({
      data: {
        customerName,
        phoneNumber,
        address,
        quantityKg,
        pricePerKg,
        totalAmount,
        paymentStatus: "PENDING",
        checkoutToken,
      },
    });
    orderId = order.id;

    const razorpayOrder = await createRazorpayOrder({
      amountPaise: amountInPaise(totalAmount),
      receipt: order.id.slice(0, 40),
      notes: { orderId: order.id },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { razorpayOrderId: razorpayOrder.id },
    });

    return jsonOk({
      orderId: order.id,
      checkoutToken,
      razorpayOrderId: razorpayOrder.id,
      amount: Number(razorpayOrder.amount),
      keyId: getRazorpayKeyId(),
      customerName,
    });
  } catch (error) {
    console.error("Create order error:", error);
    if (orderId) {
      await prisma.order.delete({ where: { id: orderId } }).catch(() => undefined);
    }
    return jsonError("Failed to create order. Please try again.", 500);
  }
}
