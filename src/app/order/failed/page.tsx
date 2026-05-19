import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

interface PageProps {
  searchParams: Promise<{ reason?: string }>;
}

const reasonMessages: Record<string, string> = {
  cancelled: "You closed the payment window. No amount was charged.",
  payment_failed: "The payment could not be completed. Please try again.",
  verification_failed: "Payment verification failed. Contact the Panchayat if amount was deducted.",
  network_error: "A network error occurred. Please check your connection and try again.",
  invalid_signature: "Payment could not be verified. Please contact support.",
};

export default async function OrderFailedPage({ searchParams }: PageProps) {
  const { reason } = await searchParams;
  const message =
    (reason && reasonMessages[reason]) ||
    "Something went wrong with your payment. Please try again.";

  return (
    <>
      <Header />
      <main className="mx-auto max-w-lg px-4 py-16">
        <div className="rounded-2xl bg-white border-2 border-red-200 p-8 shadow-sm space-y-6 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-4xl" aria-hidden>
            ✕
          </div>
          <h1 className="text-2xl font-bold text-red-800">Payment Not Completed</h1>
          <Alert variant="error">{message}</Alert>
          <div className="flex flex-col gap-3">
            <Link href="/#order">
              <Button fullWidth>Try Again</Button>
            </Link>
            <Link href="/">
              <Button variant="secondary" fullWidth>
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
