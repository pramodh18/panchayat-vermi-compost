import type { Metadata } from "next";
import { Noto_Sans_Telugu } from "next/font/google";
import "./globals.css";
import { content } from "@/lib/content";

const notoTelugu = Noto_Sans_Telugu({
  subsets: ["telugu"],
  weight: ["400", "600", "700"],
  variable: "--font-telugu",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${content.panchayat.en} | Vermi Compost Orders`,
  description: `${content.product.name.en} — ${content.product.slogan.en}. Order online at ₹10/kg. ${content.center.availability.en}`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="te">
      <body className={`min-h-screen font-sans ${notoTelugu.variable}`}>{children}</body>
    </html>
  );
}
