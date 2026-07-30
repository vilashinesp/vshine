"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import DashboardShell from "@/components/layout/DashboardShell";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { api } from "@/lib/api";
import { getOrderHistory } from "@/services/bookings";
import { Order } from "@/types";

const FLOW = ["pending", "accepted", "measurement", "cutting", "stitching", "ironing", "ready", "delivered"];

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [history, setHistory] = useState<{ status: string; created_at: string; note?: string }[]>([]);

  useEffect(() => {
    if (!params.id) return;
    api.get<Order>(`/orders/${params.id}`).then((r) => setOrder(r.data));
    getOrderHistory(params.id).then(setHistory);
  }, [params.id]);

  if (!order) {
    return (
      <DashboardShell role="customer">
        <p className="text-ink/40">Loading…</p>
      </DashboardShell>
    );
  }

  const currentIndex = FLOW.indexOf(order.status);

  return (
    <DashboardShell role="customer">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-medium">{order.order_number}</h1>
        <StatusBadge status={order.status} />
      </div>
      <p className="mt-2 font-mono text-sm text-ink/60">Total ₹{order.total_amount}</p>

      <div className="mt-10 flex items-center">
        {FLOW.map((step, i) => (
          <div key={step} className="flex flex-1 items-center last:flex-none">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium ${i <= currentIndex ? "bg-thread text-chalk" : "bg-ink/10 text-ink/40"}`}>
              {i + 1}
            </div>
            {i < FLOW.length - 1 && <div className={`mx-1 h-px flex-1 ${i < currentIndex ? "bg-thread" : "bg-ink/10"}`} />}
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs text-ink/50">
        {FLOW.map((step) => (
          <span key={step} className="capitalize">{step}</span>
        ))}
      </div>

      <h2 className="mt-12 font-display text-xl font-medium">Timeline</h2>
      <div className="mt-4 space-y-4">
        {history.map((h, i) => (
          <div key={i} className="flex gap-4 border-l border-ink/10 pl-4">
            <div>
              <p className="text-sm font-medium capitalize">{h.status}</p>
              {h.note && <p className="text-sm text-ink/60">{h.note}</p>}
              <p className="text-xs text-ink/40">{new Date(h.created_at).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
