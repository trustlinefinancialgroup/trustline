import { db } from "@/lib/db";
import { formatMoney } from "@/lib/bank";
import { methodDef } from "@/lib/methods";
import {
  approveWithdrawalAction,
  rejectWithdrawalAction,
} from "@/lib/actions/admin-actions";

export default async function WithdrawalsQueuePage() {
  const pending = await db.transaction.findMany({
    where: { status: "PENDING", type: "WITHDRAWAL" },
    include: { account: { include: { user: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      <h1 className="text-xl font-bold text-fg">Withdrawal requests</h1>
      <p className="mt-1 text-sm text-fg-muted">
        Pending withdrawals. Approving debits the client&apos;s balance and emails a
        receipt — pay out the funds externally using the client&apos;s details below.
      </p>

      {pending.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-line bg-ink-1 p-10 text-center text-sm text-fg-muted">
          No withdrawal requests waiting.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {pending.map((tx) => (
            <div key={tx.id} className="rounded-2xl border border-line bg-ink-1 p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-2xl font-semibold tracking-tight text-fg">
                    {formatMoney(Math.abs(tx.amountCents), "en", tx.account.currency)}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-fg">
                    {tx.account.user.firstName} {tx.account.user.lastName}
                    <span className="ml-2 font-normal text-fg-muted">{tx.account.user.email}</span>
                  </p>
                  <p className="mt-1 text-xs text-fg-muted">
                    {tx.reference} · {tx.account.number} · {methodDef(tx.methodKey ?? "BANK").label} ·{" "}
                    {tx.createdAt.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mt-3 rounded-xl bg-ink-2 p-4 text-sm">
                <p className="font-semibold text-fg-muted">Client&apos;s payout details</p>
                <p className="mt-1 whitespace-pre-line text-fg-muted">{tx.counterparty}</p>
              </div>

              <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-navy-50 pt-4">
                <form action={approveWithdrawalAction}>
                  <input type="hidden" name="txId" value={tx.id} />
                  <button className="rounded-md bg-green-700 px-5 py-2 text-sm font-bold text-white hover:bg-green-600">
                    Approve &amp; debit
                  </button>
                </form>
                <form action={rejectWithdrawalAction} className="flex items-end gap-2">
                  <input type="hidden" name="txId" value={tx.id} />
                  <label className="block text-xs font-semibold text-fg-muted">
                    Rejection reason (notifies client)
                    <input
                      name="reason"
                      placeholder="e.g. details didn't match"
                      className="mt-1 block w-64 rounded-md border border-line px-3 py-2 text-sm"
                    />
                  </label>
                  <button className="rounded-md border border-red-300 px-4 py-2 text-sm font-bold text-neg hover:bg-neg/10">
                    Reject
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
