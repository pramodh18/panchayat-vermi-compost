import crypto from "crypto";

/** Constant-time string comparison to prevent timing attacks. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export function generateCheckoutToken(): string {
  return crypto.randomBytes(32).toString("hex");
}
