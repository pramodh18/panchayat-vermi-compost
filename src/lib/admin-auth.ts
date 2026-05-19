import { cookies } from "next/headers";
import crypto from "crypto";
import { safeEqual } from "@/lib/crypto";

export const ADMIN_SESSION_COOKIE = "admin_session";

export function getAdminSessionToken(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return "";
  return crypto.createHash("sha256").update(`admin:${password}`).digest("hex");
}

export function isValidAdminSession(session: string | undefined): boolean {
  const expected = getAdminSessionToken();
  if (!expected || !session) return false;
  return safeEqual(expected, session);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  return isValidAdminSession(session);
}

export function validateAdminPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  const hash = (value: string) =>
    crypto.createHash("sha256").update(value).digest("hex");
  return safeEqual(hash(password), hash(adminPassword));
}

export function createAdminSessionValue(): string {
  return getAdminSessionToken();
}
