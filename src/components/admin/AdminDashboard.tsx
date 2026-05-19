"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";

type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "CANCELLED";

interface Order {
  id: string;
  customerName: string;
  phoneNumber: string;
  address: string;
  quantityKg: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  createdAt: string;
}

const statusColors: Record<PaymentStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-800",
};

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = useCallback(async (pageOverride?: number) => {
    setIsLoading(true);
    setError("");
    const currentPage = pageOverride ?? page;

    try {
      const params = new URLSearchParams();
      if (phone.trim()) params.set("phone", phone.trim());
      if (status !== "ALL") params.set("status", status);
      params.set("page", String(currentPage));
      params.set("limit", "50");

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = "/admin";
          return;
        }
        setError(data.error ?? "Failed to load orders");
        return;
      }

      setOrders(data.orders ?? []);
      setPagination(data.pagination ?? null);
    } catch {
      setError("Network error while loading orders");
    } finally {
      setIsLoading(false);
    }
  }, [phone, status, page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin";
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-primary-800">Orders Dashboard</h1>
        <Button variant="secondary" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Input
          label="Search by Phone"
          name="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="e.g. 9876543210"
        />
        <div className="space-y-2">
          <label htmlFor="status" className="block text-base font-semibold text-earth-800">
            Payment Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full min-h-12 rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="ALL">All</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <div className="flex items-end">
          <Button
            fullWidth
            onClick={() => {
              setPage(1);
              void fetchOrders(1);
            }}
            isLoading={isLoading}
          >
            Search
          </Button>
        </div>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {isLoading ? (
        <p className="text-center text-gray-600 py-8">Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="text-center text-gray-600 py-8">No orders found.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border-2 border-primary-100">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-primary-50">
              <tr>
                <th className="p-3 font-semibold">Date</th>
                <th className="p-3 font-semibold">Customer</th>
                <th className="p-3 font-semibold">Phone</th>
                <th className="p-3 font-semibold">Qty (kg)</th>
                <th className="p-3 font-semibold">Total</th>
                <th className="p-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-primary-50 hover:bg-primary-50/50">
                  <td className="p-3 whitespace-nowrap">
                    {new Date(order.createdAt).toLocaleString("en-IN")}
                  </td>
                  <td className="p-3">{order.customerName}</td>
                  <td className="p-3">{order.phoneNumber}</td>
                  <td className="p-3">{order.quantityKg}</td>
                  <td className="p-3">₹{order.totalAmount}</td>
                  <td className="p-3">
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${statusColors[order.paymentStatus]}`}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            variant="secondary"
            disabled={page <= 1 || isLoading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600 text-center">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} orders)
          </span>
          <Button
            variant="secondary"
            disabled={page >= pagination.totalPages || isLoading}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
