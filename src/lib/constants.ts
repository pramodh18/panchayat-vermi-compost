import { content } from "./content";

export const PRICE_PER_KG = 10;
export const PANCHAYAT_NAME =
  process.env.NEXT_PUBLIC_PANCHAYAT_NAME ?? content.panchayat.en;
export const PANCHAYAT_NAME_TE =
  process.env.NEXT_PUBLIC_PANCHAYAT_NAME_TE ?? content.panchayat.te;
export const CONTACT_PHONE =
  process.env.NEXT_PUBLIC_CONTACT_PHONE ?? content.phone;
export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hiramandalam.panchayat@example.com";
export const CONTACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTACT_ADDRESS ?? content.center.name.en;

export function calculateTotal(quantityKg: number): number {
  return Math.round(quantityKg * PRICE_PER_KG * 100) / 100;
}

export function amountInPaise(totalAmount: number): number {
  return Math.round(totalAmount * 100);
}
