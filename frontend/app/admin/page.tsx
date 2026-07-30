"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import { api } from "@/lib/api";

interface Summary {
  total_users: number;
  total_tailors: number;
  pending_tailor_approvals: number;
  total_orders: number;
  active_orders: number;
  total_revenue: number;
}

interface PendingTailor {
  id: string;
  shop_name: string;
  city: string | null;
}

export default function AdminDashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [pending, setPending] = useState<PendingTailor[]>([]);

  const load = () => {
    api.get<Summary>("/admin/dashboard").then((r) => setSummary(r.data));
    api.get<PendingTailor[]>("/admin/tailors/pending").then((r) => setPending(r.data));
  };

  useEffect(load, []);

  const approve = async (id: string) => {
    await api.patch(`/admin/tailors/${id}/approve`);
    load();
  };

  return (
    <DashboardShell role="admin">
      <h1 className="font-display text-3xl font-medium">Platform overview</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {summary && [
          ["Customers", summary.total_users],
          ["Tailors", summary.total_tailors],
          ["Active orders", summary.active_orders],
          ["Total orders", summary.total_orders],
          ["Pending approvals", summary.pending_tailor_approvals],
          ["Revenue", `₹${summary.total_revenue}`],
        ].map(([label, value]) => (
          <div key={label as string} className="rounded-2xl border border-ink/10 p-6">
            <p className="text-sm text-ink/60">{label}</p>
            <p className="mt-2 font-display text-3xl font-medium">{value}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 font-display text-xl font-medium">Pending tailor approvals</h2>
      <div className="mt-4 space-y-3">
        {pending.length === 0 && <p className="text-ink/40">Nothing pending.</p>}
        {pending.map((t) => (
          <div key={t.id} className="flex items-center justify-between rounded-2xl border border-ink/10 p-5">
            <div>
              <p className="font-medium">{t.shop_name}</p>
              <p className="text-sm text-ink/60">{t.city}</p>
            </div>
            <button onClick={() => approve(t.id)} className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-chalk hover:bg-ink/90">
              Approve
            </button>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
