"use client";

import { useEffect, useRef, useState } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import { api } from "@/lib/api";

interface Thread {
  id: string;
  customer_id: string;
  tailor_id: string;
}

interface Message {
  id: string;
  sender_id: string;
  message: string | null;
  created_at: string;
}

export default function ChatPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get<Thread[]>("/chat/threads").then((r) => {
      setThreads(r.data);
      if (r.data.length) setActiveThread(r.data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!activeThread) return;
    api.get<Message[]>(`/chat/threads/${activeThread}/messages`).then((r) => setMessages(r.data));
  }, [activeThread]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!draft.trim() || !activeThread) return;
    const res = await api.post<Message>("/chat/messages", { thread_id: activeThread, message: draft });
    setMessages((prev) => [...prev, res.data]);
    setDraft("");
  };

  return (
    <DashboardShell role="customer">
      <h1 className="font-display text-3xl font-medium">Chat</h1>

      <div className="mt-6 grid h-[65vh] grid-cols-3 overflow-hidden rounded-2xl border border-ink/10">
        <div className="col-span-1 overflow-y-auto border-r border-ink/10">
          {threads.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveThread(t.id)}
              className={`block w-full border-b border-ink/5 px-4 py-3 text-left text-sm ${activeThread === t.id ? "bg-ink/5 font-medium" : ""}`}
            >
              Conversation {t.id.slice(0, 8)}
            </button>
          ))}
          {threads.length === 0 && <p className="p-4 text-sm text-ink/40">No conversations yet.</p>}
        </div>

        <div className="col-span-2 flex flex-col">
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m) => (
              <div key={m.id} className="max-w-xs rounded-2xl bg-ink/5 px-4 py-2 text-sm">
                {m.message}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div className="flex gap-2 border-t border-ink/10 p-3">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type a message…"
              className="flex-1 rounded-full border border-ink/15 px-4 py-2 text-sm outline-none focus:border-thread"
            />
            <button onClick={send} className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-chalk hover:bg-ink/90">
              Send
            </button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
