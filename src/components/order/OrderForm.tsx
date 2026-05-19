"use client";

import { FormEvent, useCallback, useRef, useState } from "react";
import Script from "next/script";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { calculateTotal, PRICE_PER_KG } from "@/lib/constants";
import { content } from "@/lib/content";
import type { RazorpayCheckoutOptions, RazorpaySuccessResponse } from "@/types/razorpay";

type FormErrors = Partial<
  Record<"customerName" | "phoneNumber" | "address" | "quantityKg" | "form", string>
>;

interface CreateOrderResponse {
  success: boolean;
  orderId?: string;
  checkoutToken?: string;
  razorpayOrderId?: string;
  amount?: number;
  keyId?: string;
  customerName?: string;
  error?: string;
  fieldErrors?: FormErrors;
}

async function postOrderStatus(
  orderId: string,
  checkoutToken: string,
  status: "CANCELLED" | "FAILED"
) {
  await fetch("/api/orders/status", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId, checkoutToken, status }),
  });
}

export function OrderForm() {
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [quantityKg, setQuantityKg] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [razorpayReady, setRazorpayReady] = useState(false);
  const checkoutRef = useRef<{ orderId: string; checkoutToken: string } | null>(null);

  const quantity = parseFloat(quantityKg) || 0;
  const total = quantity > 0 ? calculateTotal(quantity) : 0;

  const openRazorpayCheckout = useCallback(
    (data: CreateOrderResponse) => {
      if (
        !window.Razorpay ||
        !data.razorpayOrderId ||
        !data.keyId ||
        !data.amount ||
        !data.orderId ||
        !data.checkoutToken
      ) {
        setErrors({ form: "Payment system is not ready. Please refresh and try again." });
        setIsSubmitting(false);
        return;
      }

      checkoutRef.current = {
        orderId: data.orderId,
        checkoutToken: data.checkoutToken,
      };

      const options: RazorpayCheckoutOptions = {
        key: data.keyId,
        amount: data.amount,
        currency: "INR",
        name: content.panchayat.te,
        description: `${content.product.name.te} - ${quantity} kg`,
        order_id: data.razorpayOrderId,
        prefill: {
          name: data.customerName,
          contact: phoneNumber,
        },
        theme: { color: "#16a34a" },
        handler: async (response: RazorpaySuccessResponse) => {
          try {
            const verifyRes = await fetch("/api/orders/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: data.orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              const token = encodeURIComponent(data.checkoutToken!);
              window.location.href = `/order/success?orderId=${data.orderId}&token=${token}`;
              return;
            }

            window.location.href = `/order/failed?reason=${encodeURIComponent(verifyData.error ?? "verification_failed")}`;
          } catch {
            window.location.href = "/order/failed?reason=network_error";
          }
        },
        modal: {
          ondismiss: async () => {
            const ctx = checkoutRef.current;
            if (ctx) {
              await postOrderStatus(ctx.orderId, ctx.checkoutToken, "CANCELLED");
            }
            setIsSubmitting(false);
            window.location.href = "/order/failed?reason=cancelled";
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", async () => {
        const ctx = checkoutRef.current;
        if (ctx) {
          await postOrderStatus(ctx.orderId, ctx.checkoutToken, "FAILED");
        }
        setIsSubmitting(false);
        window.location.href = "/order/failed?reason=payment_failed";
      });
      rzp.open();
    },
    [phoneNumber, quantity]
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    setErrors({});
    setIsSubmitting(true);

    try {
      if (!razorpayReady) {
        setErrors({ form: "Payment gateway is still loading. Please wait a moment." });
        return;
      }

      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          phoneNumber,
          address,
          quantityKg: quantity,
        }),
      });

      const data: CreateOrderResponse = await res.json();

      if (!res.ok) {
        if (data.fieldErrors) {
          setErrors(data.fieldErrors);
        } else {
          setErrors({ form: data.error ?? "Could not create order. Please try again." });
        }
        return;
      }

      openRazorpayCheckout(data);
    } catch {
      setErrors({ form: "Network error. Please check your connection and try again." });
    } finally {
      if (!checkoutRef.current) {
        setIsSubmitting(false);
      }
    }
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => setRazorpayReady(true)}
      />

      <form
        id="order"
        onSubmit={handleSubmit}
        className="rounded-2xl border-2 border-primary-100 bg-white p-6 shadow-sm sm:p-8 space-y-6"
        noValidate
      >
        <div>
          <h2 className="text-2xl font-bold text-primary-800 font-telugu">ఆన్‌లైన్ ఆర్డర్</h2>
          <p className="text-lg font-semibold text-primary-700">Online Order</p>
          <p className="mt-1 text-gray-600">
            ₹{PRICE_PER_KG} / kg · {content.product.price.te}
          </p>
        </div>

        {errors.form && <Alert variant="error">{errors.form}</Alert>}

        <Input
          label="Full Name"
          name="customerName"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Enter your full name"
          required
          autoComplete="name"
          error={errors.customerName}
        />

        <Input
          label="Phone Number"
          name="phoneNumber"
          type="tel"
          inputMode="numeric"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
          placeholder="10-digit mobile number"
          required
          autoComplete="tel"
          hint="We will call you for delivery updates"
          error={errors.phoneNumber}
        />

        <Textarea
          label="Delivery Address"
          name="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="House no., village, landmark, PIN code"
          required
          error={errors.address}
        />

        <Input
          label="Quantity (KG)"
          name="quantityKg"
          type="number"
          inputMode="decimal"
          min="0.1"
          step="0.1"
          value={quantityKg}
          onChange={(e) => setQuantityKg(e.target.value)}
          placeholder="e.g. 50"
          required
          error={errors.quantityKg}
        />

        <div
          className="rounded-xl bg-primary-50 border-2 border-primary-200 p-5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
          aria-live="polite"
        >
          <span className="text-lg font-semibold text-primary-800">Total Amount</span>
          <span className="text-2xl font-bold text-primary-700">₹{total.toFixed(2)}</span>
        </div>

        <Button
          type="submit"
          fullWidth
          isLoading={isSubmitting}
          disabled={!razorpayReady || isSubmitting}
        >
          {razorpayReady ? "Pay & Place Order" : "Loading payment..."}
        </Button>
      </form>
    </>
  );
}
