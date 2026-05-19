import { PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/db";

const ALLOWED_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  PENDING: ["CANCELLED", "FAILED"],
  PAID: [],
  FAILED: [],
  CANCELLED: [],
};

export async function updateOrderStatus(params: {
  orderId: string;
  checkoutToken: string;
  nextStatus: PaymentStatus;
}): Promise<boolean> {
  const order = await prisma.order.findFirst({
    where: { id: params.orderId, checkoutToken: params.checkoutToken },
    select: { paymentStatus: true },
  });

  if (!order) return false;

  const allowed = ALLOWED_TRANSITIONS[order.paymentStatus];
  if (!allowed.includes(params.nextStatus)) return false;

  const result = await prisma.order.updateMany({
    where: {
      id: params.orderId,
      checkoutToken: params.checkoutToken,
      paymentStatus: order.paymentStatus,
    },
    data: { paymentStatus: params.nextStatus },
  });

  return result.count > 0;
}
