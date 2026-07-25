import { db } from "@/lib/db";
import { formatMoney } from "@/lib/bank";
import {
  approveApplicationAction,
  declineApplicationAction,
  updateProductAction,
} from "@/lib/actions/admin-actions";

function toDateInput(d: Date | null) {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

function humanize(key: string) {
  return key
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const isCard = (key: string) => key.includes("CARD");

export default async function ApplicationsPage() {
  const [pending, approved] = await Promise.all([
    db.productApplication.findMany({
      where: { status: "SUBMITTED" },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    }),
    db.productApplication.findMany({
      where: { status: "APPROVED" },
      include: { user: true },
      orderBy: { decidedAt: "desc" },
    }),
  ]);

  return (
    <div>
      <h1 className="text-xl font-bold text-navy-800">Product applications</h1>
      <p className="mt-1 text-sm text-gray-600">
        Clients applying for cards, loans, and other products. Approve with the
        terms you set, or decline with a reason — the client is notified either way.
      </p>

      {pending.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-navy-200 bg-white p-10 text-center text-sm text-gray-500">
          No applications waiting.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {pending.map((app) => (
            <div key={app.id} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-bold text-navy-800">{humanize(app.productKey)}</p>
                  <p className="text-sm text-gray-600">
                    {app.user.firstName} {app.user.lastName}{" "}
                    <span className="text-gray-400">{app.user.email}</span>
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {app.createdAt.toLocaleString()}
                    {app.amountCents ? ` · Requested ${formatMoney(app.amountCents)}` : ""}
                  </p>
                </div>
              </div>
              {app.purpose && (
                <p className="mt-3 rounded-xl bg-navy-50/60 p-3 text-sm text-gray-700">{app.purpose}</p>
              )}

              <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-navy-50 pt-4">
                <form action={approveApplicationAction} className="flex flex-wrap items-end gap-2">
                  <input type="hidden" name="appId" value={app.id} />
                  <label className="block text-xs font-semibold text-gray-600">
                    Approved amount / limit (USD)
                    <input
                      name="approvedAmount"
                      type="number"
                      step="0.01"
                      placeholder="optional"
                      className="mt-1 block w-40 rounded-md border border-gray-300 px-3 py-2 text-sm"
                    />
                  </label>
                  {isCard(app.productKey) && (
                    <label className="block text-xs font-semibold text-gray-600">
                      Card tier
                      <select
                        name="cardTier"
                        className="mt-1 block rounded-md border border-gray-300 px-2 py-2 text-sm"
                      >
                        <option value="">—</option>
                        <option value="GOLD">Gold</option>
                        <option value="PLATINUM">Platinum</option>
                        <option value="BLACK">Black</option>
                      </select>
                    </label>
                  )}
                  <label className="block text-xs font-semibold text-gray-600">
                    Note (optional)
                    <input
                      name="note"
                      className="mt-1 block w-48 rounded-md border border-gray-300 px-3 py-2 text-sm"
                    />
                  </label>
                  <button className="rounded-md bg-green-700 px-5 py-2 text-sm font-bold text-white hover:bg-green-600">
                    Approve
                  </button>
                </form>

                <form action={declineApplicationAction} className="flex items-end gap-2">
                  <input type="hidden" name="appId" value={app.id} />
                  <label className="block text-xs font-semibold text-gray-600">
                    Decline reason
                    <input
                      name="note"
                      placeholder="notifies client"
                      className="mt-1 block w-48 rounded-md border border-gray-300 px-3 py-2 text-sm"
                    />
                  </label>
                  <button className="rounded-md border border-red-300 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-50">
                    Decline
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}

      {approved.length > 0 && (
        <div className="mt-12">
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">
            Approved products ({approved.length})
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Maintain each client&apos;s terms — interest, next due date, current
            balance, and card freeze. Clients see these on the product&apos;s
            detail page.
          </p>
          <div className="mt-4 space-y-4">
            {approved.map((app) => (
              <form
                key={app.id}
                action={updateProductAction}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <input type="hidden" name="appId" value={app.id} />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold text-navy-800">
                    {humanize(app.productKey)}
                    <span className="ml-2 font-normal text-gray-500">
                      {app.user.firstName} {app.user.lastName} · {app.user.email}
                    </span>
                  </p>
                  {app.frozen && (
                    <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-bold text-red-700">
                      Frozen
                    </span>
                  )}
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-4">
                  <label className="text-xs font-semibold text-gray-600">
                    Interest rate
                    <input
                      name="interestRate"
                      defaultValue={app.interestRate ?? ""}
                      placeholder="19.99% APR"
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="text-xs font-semibold text-gray-600">
                    Next due date
                    <input
                      name="dueDate"
                      type="date"
                      defaultValue={toDateInput(app.dueDate)}
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="text-xs font-semibold text-gray-600">
                    Current balance (USD)
                    <input
                      name="outstanding"
                      type="number"
                      step="0.01"
                      defaultValue={app.outstandingCents != null ? (app.outstandingCents / 100).toFixed(2) : ""}
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="flex items-end gap-2 text-xs font-semibold text-gray-600">
                    <input type="checkbox" name="frozen" defaultChecked={app.frozen} className="mb-2.5 h-4 w-4" />
                    <span className="mb-2">Frozen</span>
                  </label>
                </div>
                <div className="mt-3 flex justify-end">
                  <button className="rounded-full bg-navy-800 px-5 py-2 text-sm font-bold text-white transition hover:bg-navy-700">
                    Save terms
                  </button>
                </div>
              </form>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
