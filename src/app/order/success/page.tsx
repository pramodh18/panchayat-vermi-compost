import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { prisma } from "@/lib/db";
import { PANCHAYAT_NAME } from "@/lib/constants";

interface PageProps {
  searchParams: Promise<{ orderId?: string; token?: string }>;
}

export default async function OrderSuccessPage({ searchParams }: PageProps) {
  const { orderId, token } = await searchParams;

  const order =
    orderId && token
      ? await prisma.order.findFirst({
          where: {
            id: orderId,
            checkoutToken: decodeURIComponent(token),
            paymentStatus: "PAID",
          },
          select: {
            id: true,
            quantityKg: true,
            totalAmount: true,
            phoneNumber: true,
            paymentStatus: true,
          },
        })
      : null;

  return (
    <>
      <Header />
      <main className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="rounded-2xl bg-white border-2 border-primary-200 p-8 shadow-sm space-y-6">
          <div
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary-100 text-4xl"
            aria-hidden
          >
            ✓
          </div>
          <h1 className="text-2xl font-bold text-primary-800">Payment Successful!</h1>
          <p className="text-gray-700">
            Thank you for ordering vermi compost from {PANCHAYAT_NAME}. We have received
            your payment and will contact you soon for delivery.
          </p>

          {order ? (
            <div className="rounded-xl bg-primary-50 p-4 text-left text-sm space-y-2">
              <p>
                <span className="font-semibold">Order ID:</span> {order.id}
              </p>
              <p>
                <span className="font-semibold">Quantity:</span> {order.quantityKg} kg
              </p>
              <p>
                <span className="font-semibold">Amount Paid:</span> ₹{order.totalAmount}
              </p>
              <p>
                <span className="font-semibold">Phone:</span> {order.phoneNumber}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              Your payment was received. Save your order confirmation if you have it.
            </p>
          )}

          <Link href="/">
            <Button fullWidth>Back to Home</Button>
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
