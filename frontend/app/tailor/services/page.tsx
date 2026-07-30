"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import { api } from "@/lib/api";
import { Service, TailorProfile } from "@/types";

export default function TailorServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState({ name: "", description: "", price: "", duration_days: "3" });
  const [saving, setSaving] = useState(false);

  const load = () => api.get<TailorProfile>("/tailors/profile/me").then(async (profileRes) => {
    const res = await api.get<Service[]>(`/tailors/${profileRes.data.id}/services`);
    setServices(res.data);
  });

  useEffect(() => { load(); }, []);

  const addService = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/tailors/services", {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        duration_days: parseInt(form.duration_days, 10),
      });
      setForm({ name: "", description: "", price: "", duration_days: "3" });
      load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardShell role="tailor">
      <h1 className="font-display text-3xl font-medium">Services</h1>

      <form onSubmit={addService} className="mt-6 grid gap-4 rounded-2xl border border-ink/10 p-6 sm:grid-cols-2">
        <input required placeholder="Service name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-lg border border-ink/15 px-4 py-2.5 text-sm outline-none focus:border-thread" />
        <input placeholder="Price (₹)" required type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="rounded-lg border border-ink/15 px-4 py-2.5 text-sm outline-none focus:border-thread" />
        <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-lg border border-ink/15 px-4 py-2.5 text-sm outline-none focus:border-thread sm:col-span-2" />
        <input placeholder="Duration (days)" type="number" value={form.duration_days} onChange={(e) => setForm({ ...form, duration_days: e.target.value })} className="rounded-lg border border-ink/15 px-4 py-2.5 text-sm outline-none focus:border-thread" />
        <button type="submit" disabled={saving} className="rounded-full bg-thread px-5 py-2.5 text-sm font-medium text-chalk hover:bg-thread-dark disabled:opacity-50">
          {saving ? "Adding…" : "Add service"}
        </button>
      </form>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <div key={s.id} className="rounded-2xl border border-ink/10 p-5">
            <p className="font-display font-medium">{s.name}</p>
            <p className="mt-1 text-sm text-ink/60">{s.description}</p>
            <p className="mt-3 font-mono text-sm">₹{s.price} · {s.duration_days} days</p>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
