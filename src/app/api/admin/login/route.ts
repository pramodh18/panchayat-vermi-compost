import { NextRequest } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionValue,
  validateAdminPassword,
} from "@/lib/admin-auth";
import { adminLoginSchema } from "@/lib/validation";
import { jsonError, jsonOk, parseJsonBody } from "@/lib/api-response";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = rateLimit(`admin-login:${ip}`, { limit: 5, windowMs: 300_000 });
  if (!limit.allowed) {
    return jsonError("Too many login attempts. Try again later.", 429);
  }

  const body = await parseJsonBody<unknown>(request);
  const parsed = adminLoginSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Password is required", 400);
  }

  if (!process.env.ADMIN_PASSWORD) {
    return jsonError("Admin access is not configured", 503);
  }

  if (!validateAdminPassword(parsed.data.password)) {
    return jsonError("Invalid password", 401);
  }

  const response = jsonOk({});
  response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSessionValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return response;
}
