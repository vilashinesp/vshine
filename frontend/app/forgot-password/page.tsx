"use client";

import { useState } from "react";
import Link from "next/link";
import { forgotPassword } from "@/services/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await forgotPassword(email).catch(() => {});
    setLoading(false);
    setSent(true);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-chalk px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display text-xl font-semibold">TailorMate</Link>
        <h1 className="mt-8 font-display text-3xl font-medium">Reset your password</h1>

        {sent ? (
          <p className="mt-4 text-sm text-ink/70">
            If an account exists for <span className="font-medium">{email}</span>, a reset link is on its way.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                className="mt-1 w-full rounded-lg border border-ink/15 px-4 py-2.5 text-sm outline-none focus:border-thread"
                placeholder="you@example.com"
              />
            </div>
            <button type="submit" disabled={loading} className="w-full rounded-full bg-ink py-2.5 text-sm font-medium text-chalk hover:bg-ink/90 disabled:opacity-50">
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-ink/60">
          <Link href="/login" className="text-thread hover:underline">Back to login</Link>
        </p>
      </div>
    </main>
  );
}
