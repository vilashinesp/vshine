"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardShell from "@/components/layout/DashboardShell";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { myBookings, myOrders } from "@/services/bookings";
import { Booking, Order } from "@/types";

export default function CustomerDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([myOrders(), myBookings()])
      .then(([o, b]) => {
        setOrders(o);
        setBookings(b);
      })
      .finally(() => setLoading(false));
  }, []);

  const activeOrders = orders.filter((o) => !["delivered", "cancelled"].includes(o.status));

  return (
    <DashboardShell role="customer">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-medium">Your dashboard</h1>
        <Link href="/booking" className="rounded-full bg-thread px-5 py-2.5 text-sm font-medium text-chalk hover:bg-thread-dark">
          Book a tailor
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-ink/10 p-6">
          <p className="text-sm text-ink/60">Active orders</p>
          <p className="mt-2 font-display text-3xl font-medium">{activeOrders.length}</p>
        </div>
        <div className="rounded-2xl border border-ink/10 p-6">
          <p className="text-sm text-ink/60">Total orders</p>
          <p className="mt-2 font-display text-3xl font-medium">{orders.length}</p>
        </div>
        <div className="rounded-2xl border border-ink/10 p-6">
          <p className="text-sm text-ink/60">Pending bookings</p>
          <p className="mt-2 font-display text-3xl font-medium">{bookings.filter((b) => b.status === "pending").length}</p>
        </div>
      </div>

      <h2 className="mt-10 font-display text-xl font-medium">Recent orders</h2>
      <div className="mt-4 overflow-hidden rounded-2xl border border-ink/10">
        <table className="w-full text-sm">
          <thead className="bg-ink/5 text-left text-ink/60">
            <tr>
              <th className="px-5 py-3 font-medium">Order</th>
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={3} className="px-5 py-6 text-center text-ink/40">Loading…</td></tr>
            )}
            {!loading && orders.length === 0 && (
              <tr><td colSpan={3} className="px-5 py-6 text-center text-ink/40">No orders yet — book your first fitting.</td></tr>
            )}
            {orders.slice(0, 8).map((o) => (
              <tr key={o.id} className="border-t border-ink/5">
                <td className="px-5 py-3">
                  <Link href={`/orders/${o.id}`} className="font-medium hover:text-thread">{o.order_number}</Link>
                </td>
                <td className="px-5 py-3">₹{o.total_amount}</td>
                <td className="px-5 py-3"><StatusBadge status={o.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}
