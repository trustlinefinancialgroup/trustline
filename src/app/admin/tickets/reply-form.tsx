"use client";

import { useActionState } from "react";
import { adminReplyTicketAction } from "@/lib/actions/ticket-actions";
import type { FormState } from "@/lib/actions/auth-actions";

export function AdminTicketReply({
  ticketId,
  currentStatus,
}: {
  ticketId: string;
  currentStatus: string;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    adminReplyTicketAction,
    null
  );

  return (
    <form action={action} className="mt-6 border-t border-gray-100 pt-5">
      <input type="hidden" name="ticketId" value={ticketId} />

      {state?.error && (
        <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p className="mb-3 rounded-lg border border-green-200 bg-green-50 px-3.5 py-2.5 text-sm text-green-700">
          {state.ok}
        </p>
      )}

      <label className="block text-[13px] font-semibold text-navy-800" htmlFor="admin-reply">
        Reply to the client
      </label>
      <textarea
        id="admin-reply"
        name="body"
        required
        rows={5}
        maxLength={4000}
        className="mt-1.5 w-full resize-y rounded-lg border border-gray-300 px-3.5 py-2.5 text-[15px] text-navy-900 transition focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
      />

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label className="text-[13px] text-gray-600" htmlFor="admin-reply-status">
          Set status
        </label>
        <select
          id="admin-reply-status"
          name="status"
          defaultValue={currentStatus === "RESOLVED" ? "RESOLVED" : "AWAITING_CLIENT"}
          className="rounded-lg border border-gray-300 px-3 py-2 text-[13px] text-navy-900"
        >
          <option value="AWAITING_CLIENT">Awaiting client</option>
          <option value="OPEN">Open</option>
          <option value="RESOLVED">Resolved</option>
        </select>
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-accent-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-600 disabled:opacity-60"
        >
          {pending ? "Sending…" : "Send reply"}
        </button>
      </div>
    </form>
  );
}
