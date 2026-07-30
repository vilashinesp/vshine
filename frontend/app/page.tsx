"use client";

import { motion } from "framer-motion";
import { Scissors, Ruler, Shirt, MessageCircle, Star, Check } from "lucide-react";

const process = [
  { mark: "01", title: "Measure", desc: "Share your measurements or let our AI suggest them from a few photos.", icon: Ruler },
  { mark: "02", title: "Choose", desc: "Pick a vetted tailor near you, a service, and a fabric.", icon: Scissors },
  { mark: "03", title: "Stitch", desc: "Track cutting, stitching, and ironing in real time.", icon: Shirt },
  { mark: "04", title: "Fit", desc: "Chat with your tailor, request adjustments, get it delivered.", icon: MessageCircle },
];

const stats = [
  { value: "1,200+", label: "vetted tailors" },
  { value: "48hr", label: "avg. turnaround" },
  { value: "4.8 / 5", label: "average rating" },
  { value: "30+", label: "cities covered" },
];

const testimonials = [
  { name: "Ananya R.", quote: "My blouse fit perfectly on the first try — the measurement tracker made all the difference.", role: "Bengaluru" },
  { name: "Karthik S.", quote: "Booked a tailor for three shirts and tracked every stage from cutting to delivery.", role: "Coimbatore" },
  { name: "Fathima N.", quote: "The chat with my tailor meant zero surprises on pickup day.", role: "Chennai" },
];

const pricing = [
  { name: "Pay per order", price: "No fees", desc: "Book any tailor, pay only for what you order.", features: ["Verified tailors", "Order tracking", "In-app chat"] },
  { name: "TailorMate Plus", price: "₹149/mo", desc: "For frequent customers who want priority service.", features: ["Priority booking slots", "Free alterations pickup", "Early access to new tailors"], highlighted: true },
  { name: "For Tailors", price: "10% commission", desc: "List your shop and manage orders end to end.", features: ["Dashboard & analytics", "Zero listing fee", "Payout in 48 hours"] },
];

const faqs = [
  { q: "How are tailors vetted?", a: "Every tailor is reviewed for workmanship samples and business registration before being approved on the platform." },
  { q: "Can I track my order?", a: "Yes — every order moves through pending, accepted, measurement, cutting, stitching, ironing, ready, and delivered, visible live in your dashboard." },
  { q: "What if I need alterations?", a: "Message your tailor directly from the order thread — most alterations are handled at no extra cost within 7 days of delivery." },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-chalk text-ink">
      {/* ---------------- HERO ---------------- */}
      <section className="relative overflow-hidden border-b border-ink/10">
        <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <span className="font-display text-xl font-semibold tracking-tight">TailorMate</span>
          <div className="hidden gap-8 text-sm font-medium text-ink/70 md:flex">
            <a href="#process" className="hover:text-thread">How it works</a>
            <a href="#pricing" className="hover:text-thread">Pricing</a>
            <a href="#faq" className="hover:text-thread">FAQ</a>
          </div>
          <div className="flex gap-3">
            <a href="/login" className="rounded-full px-4 py-2 text-sm font-medium hover:bg-ink/5">Log in</a>
            <a href="/signup" className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-chalk hover:bg-ink/90">Sign up</a>
          </div>
        </nav>

        <div className="relative mx-auto grid max-w-6xl gap-12 px-6 pb-24 pt-12 md:grid-cols-2 md:items-center">
          <div>
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-thread">Book a tailor, not a guess</p>
            <h1 className="font-display text-5xl font-medium leading-[1.05] tracking-tight md:text-6xl">
              Stitched to your
              <span className="relative mx-2 inline-block italic text-thread">
                exact
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  height="10"
                  viewBox="0 0 200 10"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M2 6 Q 20 2, 40 6 T 80 6 T 120 6 T 160 6 T 198 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray="6 5"
                    fill="none"
                    className="animate-stitch-draw"
                    style={{ strokeDasharray: 1000, strokeDashoffset: 1000 }}
                  />
                </svg>
              </span>
              measurements.
            </h1>
            <p className="mt-6 max-w-md text-lg text-ink/70">
              Find a vetted tailor nearby, upload your fabric and design, and track every stitch from cutting to delivery.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="/signup" className="rounded-full bg-thread px-6 py-3 font-medium text-chalk transition hover:bg-thread-dark">
                Book your first fitting
              </a>
              <a href="/services" className="rounded-full border border-ink/20 px-6 py-3 font-medium hover:border-ink/40">
                Browse tailors
              </a>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative rounded-2xl border border-ink/10 bg-ink p-8 text-chalk shadow-2xl"
          >
            <p className="font-mono text-xs uppercase tracking-widest text-brass-light">Live measurement</p>
            <div className="mt-6 space-y-4 font-mono text-sm">
              {[
                ["Chest", "38.5 in"],
                ["Waist", "32.0 in"],
                ["Shoulder", "17.2 in"],
                ["Sleeve", "24.0 in"],
              ].map(([label, val]) => (
                <div key={label} className="flex items-center justify-between border-b border-chalk/10 pb-2">
                  <span className="text-chalk/60">{label}</span>
                  <span className="text-chalk">{val}</span>
                </div>
              ))}
            </div>
            <p className="mt-6 text-xs text-chalk/50">AI-suggested from your last 3 orders — adjust anytime.</p>
          </motion.div>
        </div>

        <div className="stitch-divider text-ink" />
      </section>

      {/* ---------------- STATS ---------------- */}
      <section className="border-b border-ink/10 bg-ink text-chalk">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-14 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="font-display text-3xl font-medium text-brass-light">{s.value}</p>
              <p className="mt-1 text-sm text-chalk/60">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- PROCESS ---------------- */}
      <section id="process" className="mx-auto max-w-6xl px-6 py-24">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-thread">The order flow</p>
        <h2 className="mt-3 font-display text-4xl font-medium tracking-tight">Four steps, fully tracked.</h2>
        <div className="mt-14 grid gap-10 md:grid-cols-4">
          {process.map((step) => (
            <div key={step.mark} className="relative border-l border-ink/10 pl-6">
              <span className="font-mono text-xs text-ink/40">{step.mark}</span>
              <step.icon className="mt-3 h-6 w-6 text-thread" strokeWidth={1.5} />
              <h3 className="mt-3 font-display text-xl font-medium">{step.title}</h3>
              <p className="mt-2 text-sm text-ink/60">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- TESTIMONIALS ---------------- */}
      <section className="border-y border-ink/10 bg-chalk-dim/40">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-thread">What customers say</p>
          <h2 className="mt-3 font-display text-4xl font-medium tracking-tight">Fit right, the first time.</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-2xl border border-ink/10 bg-chalk p-6">
                <div className="flex gap-1 text-brass">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-4 text-sm text-ink/80">{t.quote}</p>
                <p className="mt-4 font-display text-sm font-medium">{t.name}</p>
                <p className="text-xs text-ink/50">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- PRICING ---------------- */}
      <section id="pricing" className="mx-auto max-w-6xl px-6 py-24">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-thread">Pricing</p>
        <h2 className="mt-3 font-display text-4xl font-medium tracking-tight">Simple, for everyone on the platform.</h2>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {pricing.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-8 ${
                plan.highlighted ? "border-thread bg-ink text-chalk" : "border-ink/10 bg-chalk"
              }`}
            >
              <h3 className="font-display text-xl font-medium">{plan.name}</h3>
              <p className={`mt-2 text-3xl font-display font-medium ${plan.highlighted ? "text-brass-light" : ""}`}>
                {plan.price}
              </p>
              <p className={`mt-2 text-sm ${plan.highlighted ? "text-chalk/60" : "text-ink/60"}`}>{plan.desc}</p>
              <ul className="mt-6 space-y-3 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className={`h-4 w-4 ${plan.highlighted ? "text-brass-light" : "text-thread"}`} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- FAQ ---------------- */}
      <section id="faq" className="border-t border-ink/10">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-thread">FAQ</p>
          <h2 className="mt-3 font-display text-4xl font-medium tracking-tight">Questions, answered.</h2>
          <div className="mt-10 space-y-6">
            {faqs.map((f) => (
              <div key={f.q} className="border-b border-ink/10 pb-6">
                <h3 className="font-display text-lg font-medium">{f.q}</h3>
                <p className="mt-2 text-sm text-ink/60">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="bg-ink text-chalk">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <span className="font-display text-lg font-semibold">TailorMate</span>
            <div className="flex gap-8 text-sm text-chalk/60">
              <a href="/about" className="hover:text-chalk">About</a>
              <a href="/services" className="hover:text-chalk">Services</a>
              <a href="/contact" className="hover:text-chalk">Contact</a>
            </div>
          </div>
          <div className="stitch-divider mt-8 text-chalk" />
          <p className="mt-6 text-xs text-chalk/40">© 2026 TailorMate. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
