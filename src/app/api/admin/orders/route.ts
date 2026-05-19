import { NextRequest } from "next/server";
import { PaymentStatus } from "@prisma/client";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { adminOrdersQuerySchema } from "@/lib/validation";
import { jsonError, jsonOk } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return jsonError("Unauthorized", 401);
  }

  try {
    const { searchParams } = new URL(request.url);
    const parsed = adminOrdersQuerySchema.safeParse({
      phone: searchParams.get("phone") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    if (!parsed.success) {
      return jsonError("Invalid query parameters", 400);
    }

    const { phone, status, page, limit } = parsed.data;
    const skip = (page - 1) * limit;

    const where: {
      phoneNumber?: { contains: string };
      paymentStatus?: PaymentStatus;
    } = {};

    if (phone?.trim()) {
      where.phoneNumber = { contains: phone.trim() };
    }

    if (status && status !== "ALL") {
      where.paymentStatus = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          customerName: true,
          phoneNumber: true,
          address: true,
          quantityKg: true,
          totalAmount: true,
          paymentStatus: true,
          createdAt: true,
        },
      }),
      prisma.order.count({ where }),
    ]);

    return jsonOk({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin orders error:", error);
    return jsonError("Failed to fetch orders", 500);
  }
}
