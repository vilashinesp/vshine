"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { signup } from "@/services/auth";

const schema = z.object({
  full_name: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  password: z.string().min(8, "At least 8 characters"),
  role: z.enum(["customer", "tailor"]),
});

type FormData = z.infer<typeof schema>;

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { role: "customer" } });

  const role = watch("role");

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      const result = await signup(data);
      router.push(result.user.role === "tailor" ? "/tailor" : "/dashboard");
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Could not create your account");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-chalk px-6 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display text-xl font-semibold">TailorMate</Link>
        <h1 className="mt-8 font-display text-3xl font-medium">Create your account</h1>
        <p className="mt-2 text-sm text-ink/60">Book tailors or start taking orders.</p>

        <div className="mt-6 flex rounded-full border border-ink/15 p-1 text-sm">
          {(["customer", "tailor"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setValue("role", r)}
              className={`flex-1 rounded-full py-2 font-medium transition ${
                role === r ? "bg-ink text-chalk" : "text-ink/60"
              }`}
            >
              {r === "customer" ? "I'm a customer" : "I'm a tailor"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium">Full name</label>
            <input {...register("full_name")} className="mt-1 w-full rounded-lg border border-ink/15 px-4 py-2.5 text-sm outline-none focus:border-thread" placeholder="Ananya Rao" />
            {errors.full_name && <p className="mt-1 text-xs text-thread">{errors.full_name.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium">Email</label>
            <input {...register("email")} type="email" className="mt-1 w-full rounded-lg border border-ink/15 px-4 py-2.5 text-sm outline-none focus:border-thread" placeholder="you@example.com" />
            {errors.email && <p className="mt-1 text-xs text-thread">{errors.email.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium">Phone (optional)</label>
            <input {...register("phone")} className="mt-1 w-full rounded-lg border border-ink/15 px-4 py-2.5 text-sm outline-none focus:border-thread" placeholder="+91 98765 43210" />
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <input {...register("password")} type="password" className="mt-1 w-full rounded-lg border border-ink/15 px-4 py-2.5 text-sm outline-none focus:border-thread" placeholder="At least 8 characters" />
            {errors.password && <p className="mt-1 text-xs text-thread">{errors.password.message}</p>}
          </div>

          {error && <p className="text-sm text-thread">{error}</p>}

          <button type="submit" disabled={isSubmitting} className="w-full rounded-full bg-ink py-2.5 text-sm font-medium text-chalk transition hover:bg-ink/90 disabled:opacity-50">
            {isSubmitting ? "Creating account…" : "Sign up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink/60">
          Already have an account? <Link href="/login" className="text-thread hover:underline">Log in</Link>
        </p>
      </div>
    </main>
  );
}
