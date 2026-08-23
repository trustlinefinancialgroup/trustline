import { redirect } from "next/navigation";
import { activeSessions, getSession, getSessionUser, isAdmin } from "@/lib/auth";
import { revokeSessionAction } from "@/lib/actions/account-actions";
import { accountTimeline, lastEventDates } from "@/lib/account-timeline";
import { getDict, getLocale } from "@/i18n/server";
import { fill } from "@/i18n";
import { AppShell, Page, PlainShell } from "@/components/app-shell";
import { NavIcons } from "@/components/icons";
import { Card, SectionHead, StatusChip } from "@/components/ui";
import { AccountForms } from "../account-forms";
import { TwoFactorForm } from "../two-factor-form";

export const metadata = { title: "Security — Trustline Financial Group" };

const INTL: Record<string, string> = { en: "en-US", fr: "fr-FR", de: "de-DE", es: "es-ES" };

export default async function SecurityPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const session = await getSession();

  const t = await getDict();
  const locale = await getLocale();
  const admin = isAdmin(user.role);

  const [timeline, dates, sessions] = await Promise.all([
    accountTimeline(user.id),
    lastEventDates(user.id),
    activeSessions(user.id),
  ]);

  const dateFmt = new Intl.DateTimeFormat(INTL[locale] ?? "en-US", { dateStyle: "long" });
  const stampFmt = new Intl.DateTimeFormat(INTL[locale] ?? "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const day = (d: Date | null) => (d ? dateFmt.format(d) : t.account.notYet);

  const security: { label: string; value: string; good: boolean }[] = [
    {
      label: t.account.passwordLast,
      value: dates.passwordChanged ? day(dates.passwordChanged) : t.account.never,
      good: Boolean(dates.passwordChanged),
    },
    {
      label: t.account.securityWordStatus,
      value: user.securityWordHash ? t.account.securityWordOn : t.account.securityWordOff,
      good: Boolean(user.securityWordHash),
    },
    {
      // Accounts verified before this page existed have no audit entry to date,
      // so fall back to the flag rather than claiming it never happened.
      label: t.account.emailVerifiedLabel,
      value: !user.emailVerified
        ? t.account.notYet
        : dates.emailVerified
          ? day(dates.emailVerified)
          : t.account.verified,
      good: user.emailVerified,
    },
    {
      label: t.account.documentsVerifiedLabel,
      value: dates.documentsDeleted
        ? t.account.documentsDeleted
        : dates.approved
          ? t.account.documentsApproved
          : dates.documentsSubmitted
            ? t.account.documentsSubmitted
            : t.account.notYet,
      good: Boolean(dates.approved || dates.documentsDeleted),
    },
    {
      label: t.twoFactor.title,
      value: user.twoFactorEnabled ? t.twoFactor.statusOn : t.twoFactor.statusOff,
      good: user.twoFactorEnabled,
    },
    {
      label: t.account.lastSignIn,
      value: dates.lastSignIn ? stampFmt.format(dates.lastSignIn) : t.account.never,
      good: true,
    },
  ];

  const body = (
    <div className="space-y-6">
      {/* At-a-glance security posture */}
      <Card>
        <SectionHead title={t.account.securityStatusTitle} />
        <dl className="mt-4 divide-y divide-gray-100">
          {security.map((s) => (
            <div key={s.label} className="flex items-baseline justify-between gap-4 py-3">
              <dt className="text-sm text-gray-500">{s.label}</dt>
              <dd className="flex items-center gap-2 text-right text-sm font-semibold text-navy-900">
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    s.good ? "bg-green-500" : "bg-amber-400"
                  }`}
                  aria-hidden="true"
                />
                {s.value}
              </dd>
            </div>
          ))}
        </dl>
      </Card>

      {/* Signed-in devices */}
      <Card>
        <SectionHead title={t.securityPageApp.devicesTitle} subtitle={t.securityPageApp.devicesBody} />
        {sessions.length === 0 ? (
          <p className="mt-4 rounded-xl bg-navy-50/70 px-4 py-3 text-[13px] text-navy-700">
            {t.securityPageApp.devicesNone}
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-gray-100">
            {sessions.map((s) => {
              const current = s.id === session?.sid;
              return (
                <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-3.5">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-navy-600">
                      <NavIcons.device className="h-[18px] w-[18px]" />
                    </span>
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 text-sm font-semibold text-navy-900">
                        {s.label}
                        {current && (
                          <StatusChip tone="ok">{t.securityPageApp.thisDevice}</StatusChip>
                        )}
                      </p>
                      <p className="tnum mt-0.5 text-[12px] text-gray-500">
                        {fill(t.securityPageApp.lastActive, { when: stampFmt.format(s.lastSeenAt) })}
                      </p>
                    </div>
                  </div>
                  {!current && (
                    <form action={revokeSessionAction}>
                      <input type="hidden" name="sessionId" value={s.id} />
                      <button
                        type="submit"
                        className="rounded-xl border border-gray-200 px-4 py-2 text-[12px] font-semibold text-navy-800 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                      >
                        {t.securityPageApp.endSession}
                      </button>
                    </form>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        <p className="mt-3 text-[11px] text-gray-400">{t.securityPageApp.devicesNote}</p>
      </Card>

      {/* Password, security word, two-factor */}
      <Card>
        <SectionHead title={t.account.securityTitle} />
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
        <TwoFactorForm
          enabled={user.twoFactorEnabled}
          labels={{
            title: t.twoFactor.title,
            desc: t.twoFactor.settingsDesc,
            statusOn: t.twoFactor.statusOn,
            statusOff: t.twoFactor.statusOff,
            enable: t.twoFactor.enable,
            disable: t.twoFactor.disable,
            confirmWithPassword: t.twoFactor.confirmWithPassword,
            recommendation: t.twoFactor.recommendation,
            onSince: user.twoFactorEnabledAt
              ? fill(t.twoFactor.onSince, { date: dateFmt.format(user.twoFactorEnabledAt) })
              : null,
          }}
        />
      </Card>

      {/* Account history, derived from the audit log */}
      <section>
        <SectionHead title={t.account.historyTitle} subtitle={t.account.historyBody} />
        <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200/80 bg-white">
          {timeline.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-gray-500">{t.account.historyEmpty}</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {timeline.map((e) => (
                <li
                  key={e.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500"
                      aria-hidden="true"
                    />
                    <span className="text-sm font-medium text-navy-900">
                      {t.account.events[e.action] ?? e.action}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                        e.byAdmin ? "bg-navy-100 text-navy-700" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {e.byAdmin ? t.account.byTeam : t.account.byYou}
                    </span>
                  </div>
                  <time className="tnum text-xs text-gray-500">{stampFmt.format(e.at)}</time>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );

  if (admin) {
    return (
      <PlainShell
        title={t.securityPageApp.title}
        subtitle={t.securityPageApp.subtitle}
        backHref="/admin"
      >
        {body}
      </PlainShell>
    );
  }

  return (
    <AppShell
      user={user}
      active="security"
      title={t.securityPageApp.title}
      subtitle={t.securityPageApp.subtitle}
    >
      <Page>{body}</Page>
    </AppShell>
  );
}
