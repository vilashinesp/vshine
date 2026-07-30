"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import { api } from "@/lib/api";

interface Notification {
  id: string;
  title: string;
  body: string | null;
  is_read: boolean;
  created_at: string;
  link: string | null;
}

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);

  const load = () => api.get<Notification[]>("/notifications").then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);

  const markRead = async (id: string) => {
    await api.patch(`/notifications/${id}/read`);
    load();
  };

  return (
    <DashboardShell role="customer">
      <h1 className="font-display text-3xl font-medium">Notifications</h1>

      <div className="mt-6 space-y-2">
        {items.length === 0 && <p className="text-ink/40">You&apos;re all caught up.</p>}
        {items.map((n) => (
          <button
            key={n.id}
            onClick={() => !n.is_read && markRead(n.id)}
            className={`block w-full rounded-2xl border p-4 text-left ${n.is_read ? "border-ink/10" : "border-thread bg-thread/5"}`}
          >
            <p className="font-medium">{n.title}</p>
            {n.body && <p className="mt-1 text-sm text-ink/60">{n.body}</p>}
            <p className="mt-2 text-xs text-ink/40">{new Date(n.created_at).toLocaleString()}</p>
          </button>
        ))}
      </div>
    </DashboardShell>
  );
}
