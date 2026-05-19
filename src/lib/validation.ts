import { z } from "zod";
import { PRICE_PER_KG } from "./constants";

export const orderFormSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  address: z
    .string()
    .trim()
    .min(10, "Please enter a complete delivery address")
    .max(500, "Address is too long"),
  quantityKg: z
    .number({ invalid_type_error: "Quantity must be a number" })
    .finite("Quantity must be a valid number")
    .positive("Quantity must be greater than 0")
    .max(10000, "Maximum order is 10,000 kg"),
});

export type OrderFormInput = z.infer<typeof orderFormSchema>;

export const verifyPaymentSchema = z.object({
  orderId: z.string().cuid(),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export const orderStatusSchema = z.object({
  orderId: z.string().cuid(),
  checkoutToken: z.string().min(32).max(128),
});

export const adminLoginSchema = z.object({
  password: z.string().min(1, "Password is required").max(200),
});

export const adminOrdersQuerySchema = z.object({
  phone: z.string().max(15).optional(),
  status: z.enum(["PENDING", "PAID", "FAILED", "CANCELLED", "ALL"]).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
});

export function buildOrderTotals(quantityKg: number) {
  const totalAmount = Math.round(quantityKg * PRICE_PER_KG * 100) / 100;
  return { pricePerKg: PRICE_PER_KG, totalAmount };
}

export function parseQuantityKg(value: unknown): number {
  const num = typeof value === "number" ? value : Number(value);
  return num;
}
