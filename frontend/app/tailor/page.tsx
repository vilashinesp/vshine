"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardShell from "@/components/layout/DashboardShell";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { tailorBookings, tailorOrders, updateBookingStatus } from "@/services/bookings";
import { Booking, Order } from "@/types";

export default function TailorDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    Promise.all([tailorBookings("pending"), tailorOrders()])
      .then(([b, o]) => {
        setBookings(b);
        setOrders(o);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const respond = async (id: string, status: "accepted" | "rejected") => {
    await updateBookingStatus(id, status);
    load();
  };

  const revenue = orders.reduce((sum, o) => sum + (o.status === "delivered" ? o.total_amount : 0), 0);

  return (
    <DashboardShell role="tailor">
      <h1 className="font-display text-3xl font-medium">Tailor dashboard</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-ink/10 p-6">
          <p className="text-sm text-ink/60">Pending requests</p>
          <p className="mt-2 font-display text-3xl font-medium">{bookings.length}</p>
        </div>
        <div className="rounded-2xl border border-ink/10 p-6">
          <p className="text-sm text-ink/60">Total orders</p>
          <p className="mt-2 font-display text-3xl font-medium">{orders.length}</p>
        </div>
        <div className="rounded-2xl border border-ink/10 p-6">
          <p className="text-sm text-ink/60">Revenue (delivered)</p>
          <p className="mt-2 font-display text-3xl font-medium">₹{revenue}</p>
        </div>
      </div>

      <h2 className="mt-10 font-display text-xl font-medium">Booking requests</h2>
      <div className="mt-4 space-y-3">
        {loading && <p className="text-ink/40">Loading…</p>}
        {!loading && bookings.length === 0 && <p className="text-ink/40">No pending requests.</p>}
        {bookings.map((b) => (
          <div key={b.id} className="flex items-center justify-between rounded-2xl border border-ink/10 p-5">
            <div>
              <p className="font-medium">Booking on {b.booking_date} at {b.booking_time}</p>
              {b.notes && <p className="mt-1 text-sm text-ink/60">{b.notes}</p>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => respond(b.id, "rejected")} className="rounded-full border border-ink/15 px-4 py-2 text-sm font-medium hover:border-thread hover:text-thread">
                Decline
              </button>
              <button onClick={() => respond(b.id, "accepted")} className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-chalk hover:bg-ink/90">
                Accept
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="font-display text-xl font-medium">Recent orders</h2>
        <Link href="/tailor/orders" className="text-sm text-thread hover:underline">View all</Link>
      </div>
      <div className="mt-4 space-y-3">
        {orders.slice(0, 5).map((o) => (
          <div key={o.id} className="flex items-center justify-between rounded-2xl border border-ink/10 p-5">
            <p className="font-medium">{o.order_number}</p>
            <StatusBadge status={o.status} />
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
