"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { tailorOrders, updateOrderStatus } from "@/services/bookings";
import { Order, OrderStatus } from "@/types";

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  accepted: "measurement",
  measurement: "cutting",
  cutting: "stitching",
  stitching: "ironing",
  ironing: "ready",
  ready: "delivered",
};

export default function TailorOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => tailorOrders().then(setOrders).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const advance = async (order: Order) => {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    await updateOrderStatus(order.id, next);
    load();
  };

  return (
    <DashboardShell role="tailor">
      <h1 className="font-display text-3xl font-medium">Orders</h1>

      <div className="mt-6 space-y-3">
        {loading && <p className="text-ink/40">Loading…</p>}
        {!loading && orders.length === 0 && <p className="text-ink/40">No orders yet.</p>}
        {orders.map((o) => {
          const next = NEXT_STATUS[o.status];
          return (
            <div key={o.id} className="flex items-center justify-between rounded-2xl border border-ink/10 p-5">
              <div>
                <p className="font-medium">{o.order_number}</p>
                <p className="mt-1 font-mono text-sm text-ink/50">₹{o.total_amount}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={o.status} />
                {next && (
                  <button
                    onClick={() => advance(o)}
                    className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-chalk hover:bg-ink/90"
                  >
                    Mark {next}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </DashboardShell>
  );
}
