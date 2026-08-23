"use client";

import { useActionState } from "react";
import { replyToTicketAction } from "@/lib/actions/ticket-actions";
import type { FormState } from "@/lib/actions/auth-actions";

export function TicketReplyForm({
  ticketId,
  labels,
}: {
  ticketId: string;
  labels: { placeholder: string; send: string; sending: string };
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(replyToTicketAction, null);

  return (
    <form action={action} className="mt-5 space-y-3">
      <input type="hidden" name="ticketId" value={ticketId} />
      {state?.error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {state.error}
        </p>
      )}
      <textarea
        name="body"
        required
        rows={4}
        maxLength={4000}
        placeholder={labels.placeholder}
        className="w-full resize-y rounded-lg border border-gray-300 px-3.5 py-2.5 text-[15px] text-navy-900 transition focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-accent-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-600 disabled:opacity-60"
      >
        {pending ? labels.sending : labels.send}
      </button>
    </form>
  );
}
