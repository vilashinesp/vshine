"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardShell from "@/components/layout/DashboardShell";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { myOrders } from "@/services/bookings";
import { Order } from "@/types";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    myOrders().then(setOrders).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardShell role="customer">
      <h1 className="font-display text-3xl font-medium">Your orders</h1>

      <div className="mt-6 space-y-3">
        {loading && <p className="text-ink/40">Loading…</p>}
        {!loading && orders.length === 0 && <p className="text-ink/40">No orders yet.</p>}
        {orders.map((o) => (
          <Link
            key={o.id}
            href={`/orders/${o.id}`}
            className="flex items-center justify-between rounded-2xl border border-ink/10 p-5 hover:border-thread"
          >
            <div>
              <p className="font-display font-medium">{o.order_number}</p>
              {o.estimated_delivery && <p className="mt-1 text-xs text-ink/50">Est. delivery {o.estimated_delivery}</p>}
            </div>
            <div className="flex items-center gap-4">
              <span className="font-mono text-sm">₹{o.total_amount}</span>
              <StatusBadge status={o.status} />
            </div>
          </Link>
        ))}
      </div>
    </DashboardShell>
  );
}
