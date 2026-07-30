"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import { getMe } from "@/services/auth";
import { User } from "@/types";

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    getMe().then(setUser);
  }, []);

  const toggleDark = () => {
    setDark((d) => !d);
    document.documentElement.classList.toggle("dark");
  };

  if (!user) return <DashboardShell role="customer"><p className="text-ink/40">Loading…</p></DashboardShell>;

  return (
    <DashboardShell role={user.role}>
      <h1 className="font-display text-3xl font-medium">Settings</h1>

      <div className="mt-6 max-w-sm space-y-6">
        <div className="flex items-center justify-between rounded-2xl border border-ink/10 p-5">
          <div>
            <p className="font-medium">Dark mode</p>
            <p className="text-sm text-ink/60">Switch between light and dark theme.</p>
          </div>
          <button
            onClick={toggleDark}
            className={`h-6 w-11 rounded-full transition ${dark ? "bg-ink" : "bg-ink/20"}`}
          >
            <span className={`block h-5 w-5 translate-y-0.5 rounded-full bg-chalk transition ${dark ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        </div>

        <div className="rounded-2xl border border-ink/10 p-5">
          <p className="font-medium">Email notifications</p>
          <p className="mt-1 text-sm text-ink/60">Order and booking updates are sent to {user.email}.</p>
        </div>
      </div>
    </DashboardShell>
  );
}
