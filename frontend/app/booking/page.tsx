"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/layout/DashboardShell";
import { browseTailors, createBooking, getTailorServices } from "@/services/bookings";
import { Service, TailorProfile } from "@/types";

const STEPS = ["Tailor", "Service", "Schedule", "References"];

export default function BookingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [tailors, setTailors] = useState<TailorProfile[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedTailor, setSelectedTailor] = useState<TailorProfile | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    browseTailors().then(setTailors);
  }, []);

  useEffect(() => {
    if (selectedTailor) getTailorServices(selectedTailor.id).then(setServices);
  }, [selectedTailor]);

  const submit = async () => {
    if (!selectedTailor || !selectedService || !date || !time) return;
    setSubmitting(true);
    setError(null);
    try {
      await createBooking({
        tailor_id: selectedTailor.id,
        service_id: selectedService.id,
        booking_date: date,
        booking_time: time,
        notes,
      });
      router.push("/dashboard");
    } catch {
      setError("Couldn't create the booking — please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardShell role="customer">
      <h1 className="font-display text-3xl font-medium">Book a tailor</h1>

      <div className="mt-6 flex gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className={`flex-1 rounded-full py-1.5 text-center text-xs font-medium ${i <= step ? "bg-ink text-chalk" : "bg-ink/5 text-ink/40"}`}>
            {s}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tailors.map((t) => (
            <button
              key={t.id}
              onClick={() => { setSelectedTailor(t); setStep(1); }}
              className="rounded-2xl border border-ink/10 p-5 text-left hover:border-thread"
            >
              <p className="font-display text-lg font-medium">{t.shop_name}</p>
              <p className="mt-1 text-sm text-ink/60">{t.city}</p>
              <p className="mt-3 text-sm text-brass">★ {t.avg_rating} ({t.total_reviews})</p>
            </button>
          ))}
          {tailors.length === 0 && <p className="text-ink/50">No tailors found nearby yet.</p>}
        </div>
      )}

      {step === 1 && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {services.map((s) => (
            <button
              key={s.id}
              onClick={() => { setSelectedService(s); setStep(2); }}
              className="rounded-2xl border border-ink/10 p-5 text-left hover:border-thread"
            >
              <p className="font-display text-lg font-medium">{s.name}</p>
              <p className="mt-1 text-sm text-ink/60">{s.description}</p>
              <p className="mt-3 font-mono text-sm">₹{s.price} · {s.duration_days} days</p>
            </button>
          ))}
          {services.length === 0 && <p className="text-ink/50">This tailor hasn&apos;t listed services yet.</p>}
        </div>
      )}

      {step === 2 && (
        <div className="mt-8 max-w-sm space-y-4">
          <div>
            <label className="text-sm font-medium">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 w-full rounded-lg border border-ink/15 px-4 py-2.5 text-sm outline-none focus:border-thread" />
          </div>
          <div>
            <label className="text-sm font-medium">Time</label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="mt-1 w-full rounded-lg border border-ink/15 px-4 py-2.5 text-sm outline-none focus:border-thread" />
          </div>
          <button disabled={!date || !time} onClick={() => setStep(3)} className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-chalk disabled:opacity-40">
            Continue
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="mt-8 max-w-sm space-y-4">
          <div>
            <label className="text-sm font-medium">Notes for your tailor</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} className="mt-1 w-full rounded-lg border border-ink/15 px-4 py-2.5 text-sm outline-none focus:border-thread" placeholder="Fabric preferences, fit notes, occasion…" />
          </div>
          <p className="text-xs text-ink/50">Cloth, design, and measurement photo upload happens after booking confirmation from your order page.</p>
          {error && <p className="text-sm text-thread">{error}</p>}
          <button onClick={submit} disabled={submitting} className="rounded-full bg-thread px-5 py-2.5 text-sm font-medium text-chalk hover:bg-thread-dark disabled:opacity-50">
            {submitting ? "Booking…" : "Confirm booking"}
          </button>
        </div>
      )}
    </DashboardShell>
  );
}
