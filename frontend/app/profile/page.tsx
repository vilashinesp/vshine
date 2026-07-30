"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import { getMe } from "@/services/auth";
import { api } from "@/lib/api";
import { User } from "@/types";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getMe().then((u) => {
      setUser(u);
      setFullName(u.full_name);
      setPhone(u.phone || "");
    });
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await api.patch("/users/me", { full_name: fullName, phone });
    setSaving(false);
    setSaved(true);
  };

  if (!user) return <DashboardShell role="customer"><p className="text-ink/40">Loading…</p></DashboardShell>;

  return (
    <DashboardShell role={user.role}>
      <h1 className="font-display text-3xl font-medium">Profile</h1>

      <form onSubmit={save} className="mt-6 max-w-sm space-y-4">
        <div>
          <label className="text-sm font-medium">Full name</label>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1 w-full rounded-lg border border-ink/15 px-4 py-2.5 text-sm outline-none focus:border-thread" />
        </div>
        <div>
          <label className="text-sm font-medium">Email</label>
          <input value={user.email} disabled className="mt-1 w-full rounded-lg border border-ink/10 bg-ink/5 px-4 py-2.5 text-sm text-ink/50" />
        </div>
        <div>
          <label className="text-sm font-medium">Phone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full rounded-lg border border-ink/15 px-4 py-2.5 text-sm outline-none focus:border-thread" />
        </div>
        <button type="submit" disabled={saving} className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-chalk hover:bg-ink/90 disabled:opacity-50">
          {saving ? "Saving…" : "Save changes"}
        </button>
        {saved && <p className="text-sm text-green-700">Saved.</p>}
      </form>
    </DashboardShell>
  );
}
