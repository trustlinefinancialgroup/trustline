"use client";

import { useState } from "react";
import { Composer, MessageList, useChatPolling, type ThreadLabels } from "@/components/chat-thread";

// The signed-in version of live chat: a docked panel rather than a floating
// bubble, and no pre-chat form — the account already tells us who they are.

export function SupportConsole({
  clientName,
  labels,
  locale,
}: {
  clientName: string;
  labels: ThreadLabels & {
    online: string;
    signedInAs: string;
    startTitle: string;
    startBody: string;
    startPlaceholder: string;
    startButton: string;
    starting: string;
  };
  locale: string;
}) {
  const { messages, setMessages, started, poll } = useChatPolling(true, 4000);
  const [pending, setPending] = useState(false);

  async function handleStart(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const field = form.elements.namedItem("message") as HTMLTextAreaElement;
    const message = field.value.trim();
    if (!message) return;
    setPending(true);
    await fetch("/api/chat/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    setPending(false);
    field.value = "";
    await poll();
  }

  async function handleSend(body: string) {
    setMessages((m) => [...m, { sender: "VISITOR", body, at: new Date().toISOString() }]);
    await fetch("/api/chat/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    poll();
  }

  return (
    <div className="flex h-[min(34rem,calc(100vh-16rem))] flex-col overflow-hidden rounded-2xl border border-line bg-ink-1 shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-line-soft bg-ink-1 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-900 text-sm font-bold text-white">
            T
          </span>
          <div>
            <p className="text-sm font-semibold text-fg">{labels.agent}</p>
            <p className="flex items-center gap-1.5 text-xs text-fg-muted">
              <span className="h-2 w-2 rounded-full bg-pos/100" />
              {labels.online}
            </p>
          </div>
        </div>
        <p className="hidden text-xs text-fg-muted sm:block">
          {labels.signedInAs} <span className="font-semibold text-fg">{clientName}</span>
        </p>
      </div>

      {started ? (
        <>
          <MessageList
            messages={messages}
            labels={labels}
            locale={locale}
            className="flex-1 bg-ink-2/40 p-5"
          />
          <Composer labels={labels} onSend={handleSend} />
        </>
      ) : (
        <form onSubmit={handleStart} className="flex flex-1 flex-col justify-center p-6 sm:p-10">
          <h2 className="text-lg font-semibold text-fg">{labels.startTitle}</h2>
          <p className="mt-2 text-sm leading-relaxed text-fg-muted">{labels.startBody}</p>
          <textarea
            name="message"
            required
            rows={4}
            placeholder={labels.startPlaceholder}
            className="mt-5 w-full resize-none rounded-xl border border-line bg-ink-2 px-4 py-3 text-sm text-fg focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
          />
          <button
            disabled={pending}
            className="mt-4 self-start rounded-xl bg-brand-500 px-8 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
          >
            {pending ? labels.starting : labels.startButton}
          </button>
        </form>
      )}
    </div>
  );
}
