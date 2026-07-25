import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser, isAdmin } from "@/lib/auth";
import { logoutAction } from "@/lib/actions/auth-actions";
import { db } from "@/lib/db";
import { Logo } from "@/components/logo";

export const metadata = { title: "Admin — Trustline Financial Group" };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user || !isAdmin(user.role) || user.status !== "ACTIVE") {
    redirect("/login");
  }

  const [pendingCount, depositCount, withdrawalCount, applicationCount] = await Promise.all([
    db.user.count({ where: { status: "PENDING", role: "CLIENT" } }),
    db.transaction.count({ where: { status: "PENDING", type: "DEPOSIT" } }),
    db.transaction.count({ where: { status: "PENDING", type: "WITHDRAWAL" } }),
    db.productApplication.count({ where: { status: "SUBMITTED" } }),
  ]);

  const nav = [
    { href: "/admin", label: "Review queue", badge: pendingCount },
    { href: "/admin/applications", label: "Applications", badge: applicationCount },
    { href: "/admin/deposits", label: "Deposits", badge: depositCount },
    { href: "/admin/withdrawals", label: "Withdrawals", badge: withdrawalCount },
    { href: "/admin/clients", label: "Clients" },
    { href: "/admin/inbox", label: "Inbox" },
    { href: "/admin/messages", label: "Messages" },
    { href: "/admin/methods", label: "Methods" },
    { href: "/admin/audit", label: "Audit log" },
  ];

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-navy-50/50">
      <header className="border-b border-white/10 bg-navy-900">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
          <Logo theme="dark" href="/admin" subtitle="Admin" />
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-navy-300 sm:block">{user.email}</span>
            <form action={logoutAction}>
              <button className="rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-10 px-6 py-10">
        <nav className="w-52 shrink-0 space-y-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between rounded-lg px-3.5 py-2.5 text-sm font-semibold text-navy-800 transition hover:bg-white hover:shadow-sm"
            >
              {item.label}
              {item.badge ? (
                <span className="rounded-full bg-accent-500 px-2 py-0.5 text-xs font-bold text-white">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          ))}
        </nav>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
