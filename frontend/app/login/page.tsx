"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { login } from "@/services/auth";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      const result = await login(data.email, data.password);
      router.push(result.user.role === "admin" ? "/admin" : result.user.role === "tailor" ? "/tailor" : "/dashboard");
    } catch {
      setError("Incorrect email or password");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-chalk px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display text-xl font-semibold">TailorMate</Link>
        <h1 className="mt-8 font-display text-3xl font-medium">Welcome back</h1>
        <p className="mt-2 text-sm text-ink/60">Log in to track your orders and bookings.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              {...register("email")}
              type="email"
              className="mt-1 w-full rounded-lg border border-ink/15 px-4 py-2.5 text-sm outline-none focus:border-thread"
              placeholder="you@example.com"
            />
            {errors.email && <p className="mt-1 text-xs text-thread">{errors.email.message}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Password</label>
              <Link href="/forgot-password" className="text-xs text-thread hover:underline">Forgot?</Link>
            </div>
            <input
              {...register("password")}
              type="password"
              className="mt-1 w-full rounded-lg border border-ink/15 px-4 py-2.5 text-sm outline-none focus:border-thread"
              placeholder="••••••••"
            />
            {errors.password && <p className="mt-1 text-xs text-thread">{errors.password.message}</p>}
          </div>

          {error && <p className="text-sm text-thread">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-ink py-2.5 text-sm font-medium text-chalk transition hover:bg-ink/90 disabled:opacity-50"
          >
            {isSubmitting ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink/60">
          Don&apos;t have an account? <Link href="/signup" className="text-thread hover:underline">Sign up</Link>
        </p>
      </div>
    </main>
  );
}
