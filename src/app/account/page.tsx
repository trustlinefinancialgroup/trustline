import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser, isAdmin } from "@/lib/auth";
import { logoutAction } from "@/lib/actions/auth-actions";
import { getDict, getLocale } from "@/i18n/server";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Logo } from "@/components/logo";
import { AccountForms } from "./account-forms";

export const metadata = { title: "Account settings — Trustline Financial Group" };

export default async function AccountPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const t = await getDict();
  const locale = await getLocale();
  const home = isAdmin(user.role) ? "/admin" : "/dashboard";

  return (
    <main className="flex min-h-screen flex-1 flex-col bg-navy-50/50">
      <header className="border-b border-white/10 bg-navy-900">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
          <Logo theme="dark" href={home} />
          <div className="flex items-center gap-3">
            <LanguageSwitcher current={locale} variant="dark" />
            <form action={logoutAction}>
              <button className="rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">
                {t.common.signOut}
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-lg flex-1 px-6 py-12">
        <Link href={home} className="text-sm font-semibold text-accent-600 hover:text-accent-700">
          ← {t.bank.back}
        </Link>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-navy-900">
          {t.account.title}
        </h1>
        <AccountForms
          hasSecurityWord={!!user.securityWordHash}
          labels={{
            changePassword: t.account.changePassword,
            currentPassword: t.account.currentPassword,
            newPassword: t.account.newPassword,
            confirmPassword: t.account.confirmPassword,
            updatePassword: t.account.updatePassword,
            securityWordTitle: t.account.securityWordTitle,
            securityWordDesc: t.account.securityWordDesc,
            securityWordLabel: t.account.securityWordLabel,
            passwordToConfirm: t.account.passwordToConfirm,
            saveSecurityWord: t.account.saveSecurityWord,
            securityWordActive: t.account.securityWordActive,
            passwordHint: t.auth.passwordHint,
          }}
        />
      </div>
    </main>
  );
}
