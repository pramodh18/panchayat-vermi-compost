-- AlterTable: checkout token for client-side status updates; unique payment id for idempotency
ALTER TABLE "Order" ADD COLUMN "checkoutToken" TEXT;

UPDATE "Order" SET "checkoutToken" = md5(random()::text || id::text || clock_timestamp()::text) WHERE "checkoutToken" IS NULL;

ALTER TABLE "Order" ALTER COLUMN "checkoutToken" SET NOT NULL;

CREATE UNIQUE INDEX "Order_checkoutToken_key" ON "Order"("checkoutToken");

CREATE UNIQUE INDEX "Order_razorpayPaymentId_key" ON "Order"("razorpayPaymentId");
