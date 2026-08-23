import Link from "next/link";
import { db } from "@/lib/db";
import { AdminTicketReply } from "./reply-form";

export const metadata = { title: "Support tickets — Trustline Admin" };

// Admin surfaces stay in English by design — the client-facing side is the
// part that is translated.
const STATUS_LABELS: Record<string, string> = {
  OPEN: "Open",
  AWAITING_CLIENT: "Awaiting client",
  RESOLVED: "Resolved",
};

const STATUS_STYLES: Record<string, string> = {
  OPEN: "bg-amber-50 text-amber-700 ring-amber-600/15",
  AWAITING_CLIENT: "bg-accent-50 text-accent-700 ring-accent-600/15",
  RESOLVED: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
};

export default async function AdminTicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ ticket?: string; status?: string }>;
}) {
  const { ticket: ticketParam, status: statusFilter } = await searchParams;

  const tickets = await db.supportTicket.findMany({
    where: statusFilter && STATUS_LABELS[statusFilter] ? { status: statusFilter } : {},
    orderBy: [{ unreadForAdmin: "desc" }, { lastMessageAt: "desc" }],
    take: 100,
    include: { user: { select: { firstName: true, lastName: true, email: true } } },
  });

  const selected = ticketParam
    ? await db.supportTicket.findUnique({
        where: { id: ticketParam },
        include: {
          user: { select: { firstName: true, lastName: true, email: true, accountType: true } },
          messages: { orderBy: { createdAt: "asc" } },
        },
      })
    : null;

  // Opening a ticket in the console counts as reading it.
  if (selected?.unreadForAdmin) {
    await db.supportTicket.update({
      where: { id: selected.id },
      data: { unreadForAdmin: false },
    });
  }

  const stampFmt = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-navy-900">Support tickets</h1>
      <p className="mt-1 text-sm text-gray-500">
        Requests raised by clients from their account. Every reply is emailed to them as a
        notification.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {[undefined, "OPEN", "AWAITING_CLIENT", "RESOLVED"].map((s) => (
          <Link
            key={s ?? "all"}
            href={s ? `/admin/tickets?status=${s}` : "/admin/tickets"}
            className={`rounded-full border px-4 py-1.5 text-[13px] font-semibold transition ${
              statusFilter === s || (!statusFilter && !s)
                ? "border-navy-800 bg-navy-800 text-white"
                : "border-gray-200 bg-white text-navy-800 hover:border-accent-500/40"
            }`}
          >
            {s ? STATUS_LABELS[s] : "All"}
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
        {/* Queue */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          {tickets.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-gray-500">No tickets.</p>
          ) : (
            tickets.map((ticket, i) => (
              <Link
                key={ticket.id}
                href={`/admin/tickets?ticket=${ticket.id}${
                  statusFilter ? `&status=${statusFilter}` : ""
                }`}
                className={`block px-4 py-3.5 transition hover:bg-navy-50/60 ${
                  i > 0 ? "border-t border-gray-100" : ""
                } ${selected?.id === ticket.id ? "bg-navy-50" : ""}`}
              >
                <div className="flex items-center gap-2">
                  {ticket.unreadForAdmin && (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-accent-500" aria-hidden="true" />
                  )}
                  <p className="truncate text-[13px] font-semibold text-navy-900">
                    {ticket.subject}
                  </p>
                </div>
                <p className="mt-0.5 truncate text-[12px] text-gray-500">
                  {ticket.user.firstName} {ticket.user.lastName} · {ticket.category}
                </p>
                <p className="mt-1 text-[11px] tabular-nums text-gray-400">
                  {ticket.reference} · {stampFmt.format(ticket.lastMessageAt)}
                </p>
              </Link>
            ))
          )}
        </div>

        {/* Thread */}
        <div>
          {!selected ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white/60 px-6 py-16 text-center text-sm text-gray-500">
              Select a ticket to read it.
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold tracking-tight text-navy-900">
                    {selected.subject}
                  </h2>
                  <p className="mt-1 text-[13px] text-gray-500">
                    {selected.user.firstName} {selected.user.lastName} · {selected.user.email} ·{" "}
                    {selected.user.accountType}
                  </p>
                  <p className="mt-0.5 text-[12px] tabular-nums text-gray-400">
                    {selected.reference} · {selected.category} · opened{" "}
                    {stampFmt.format(selected.createdAt)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${
                    STATUS_STYLES[selected.status] ?? STATUS_STYLES.OPEN
                  }`}
                >
                  {STATUS_LABELS[selected.status] ?? selected.status}
                </span>
              </div>

              <ul className="mt-5 space-y-3">
                {selected.messages.map((m) => {
                  const fromTeam = m.sender === "ADMIN";
                  return (
                    <li
                      key={m.id}
                      className={`rounded-xl border px-4 py-3 ${
                        fromTeam
                          ? "border-accent-100 bg-accent-50/50"
                          : "border-gray-200 bg-gray-50/60"
                      }`}
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="text-[12px] font-semibold text-navy-900">{m.authorLabel}</p>
                        <time className="text-[11px] tabular-nums text-gray-500">
                          {stampFmt.format(m.createdAt)}
                        </time>
                      </div>
                      <p className="mt-1.5 whitespace-pre-line text-[14px] leading-relaxed text-gray-700">
                        {m.body}
                      </p>
                    </li>
                  );
                })}
              </ul>

              <AdminTicketReply ticketId={selected.id} currentStatus={selected.status} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
