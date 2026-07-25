"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { sender: string; body: string; at: string };

export type ChatLabels = {
  open: string;
  title: string;
  subtitle: string;
  name: string;
  phone: string;
  email: string;
  cardLast4: string;
  contactHint: string;
  message: string;
  start: string;
  placeholder: string;
  send: string;
  contactRequired: string;
  agent: string;
  closed: string;
};

const field =
  "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-navy-900 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20";

export function ChatWidget({
  labels,
  prefill,
}: {
  labels: ChatLabels;
  prefill?: { name?: string; email?: string };
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"loading" | "form" | "thread">("loading");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function poll() {
    try {
      const r = await fetch("/api/chat/poll", { cache: "no-store" });
      const d = await r.json();
      if (d.conversation) {
        setMessages(d.messages);
        setMode("thread");
      } else if (mode === "loading") {
        setMode("form");
      }
    } catch {
      if (mode === "loading") setMode("form");
    }
  }

  useEffect(() => {
    poll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!open || mode !== "thread") return;
    const id = setInterval(poll, 4000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, open]);

  async function handleStart(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get("name"),
      phone: fd.get("phone"),
      email: fd.get("email"),
      cardLast4: fd.get("cardLast4"),
      message: fd.get("message"),
    };
    if (!String(payload.email || "").trim() && !String(payload.cardLast4 || "").trim()) {
      setError(labels.contactRequired);
      return;
    }
    setPending(true);
    const r = await fetch("/api/chat/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setPending(false);
    if (r.ok) await poll();
    else setError(labels.contactRequired);
  }

  async function handleSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem("body") as HTMLInputElement;
    const body = input.value.trim();
    if (!body) return;
    input.value = "";
    setMessages((m) => [...m, { sender: "VISITOR", body, at: new Date().toISOString() }]);
    await fetch("/api/chat/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    poll();
  }

  return (
    <div className="fixed bottom-5 right-5 z-[70] flex flex-col items-end">
      {open && (
        <div className="mb-3 flex h-[30rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-navy-900/25">
          {/* Header */}
          <div className="flex items-center justify-between bg-navy-900 px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-white">{labels.title}</p>
              <p className="text-xs text-navy-300">{labels.subtitle}</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="rounded-full p-1 text-navy-300 transition hover:bg-white/10 hover:text-white"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          {/* Body */}
          {mode === "thread" ? (
            <>
              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-navy-50/40 p-4">
                {messages.map((m, i) => (
                  <div key={i} className={m.sender === "VISITOR" ? "flex justify-end" : "flex justify-start"}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                        m.sender === "VISITOR"
                          ? "rounded-br-sm bg-accent-500 text-white"
                          : "rounded-bl-sm border border-gray-200 bg-white text-navy-900"
                      }`}
                    >
                      {m.sender === "ADMIN" && (
                        <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wide text-accent-600">
                          {labels.agent}
                        </p>
                      )}
                      <p className="whitespace-pre-line">{m.body}</p>
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-gray-100 p-3">
                <input
                  name="body"
                  autoComplete="off"
                  placeholder={labels.placeholder}
                  className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
                />
                <button className="rounded-full bg-accent-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-600">
                  {labels.send}
                </button>
              </form>
            </>
          ) : (
            <form onSubmit={handleStart} className="flex-1 space-y-3 overflow-y-auto p-5">
              <label className="block text-[13px] font-semibold text-navy-800">
                {labels.name}
                <input name="name" required defaultValue={prefill?.name} className={field} />
              </label>
              <label className="block text-[13px] font-semibold text-navy-800">
                {labels.phone}
                <input name="phone" type="tel" className={field} />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="block text-[13px] font-semibold text-navy-800">
                  {labels.email}
                  <input name="email" type="email" defaultValue={prefill?.email} className={field} />
                </label>
                <label className="block text-[13px] font-semibold text-navy-800">
                  {labels.cardLast4}
                  <input name="cardLast4" inputMode="numeric" maxLength={4} className={field} />
                </label>
              </div>
              <p className="text-xs text-gray-500">{labels.contactHint}</p>
              <label className="block text-[13px] font-semibold text-navy-800">
                {labels.message}
                <textarea name="message" required rows={3} className={field} />
              </label>
              {error && <p className="text-xs text-red-600">{error}</p>}
              <button
                disabled={pending}
                className="w-full rounded-full bg-accent-500 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-600 disabled:opacity-60"
              >
                {labels.start}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Launcher */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={labels.open}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-500 text-white shadow-lg shadow-accent-700/30 transition hover:bg-accent-600"
      >
        {open ? (
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.5L3 20l1.1-3.4A8.5 8.5 0 1 1 21 11.5z" />
          </svg>
        )}
      </button>
    </div>
  );
}
