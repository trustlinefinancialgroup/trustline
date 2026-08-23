import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser, isAdmin } from "@/lib/auth";
import { formatMoney } from "@/lib/bank";
import { loadPortfolio } from "@/lib/portfolio";
import { methodDef, methodVisibleFor } from "@/lib/methods";
import { getDict, getLocale } from "@/i18n/server";
import { AppShell, Page } from "@/components/app-shell";
import { PaymentIcon } from "@/components/payment-icons";
import { Card, Eyebrow, Tabs } from "@/components/ui";
import { DepositForm } from "../deposit/deposit-form";
import { RequestMethod } from "../deposit/request-method";
import { WithdrawForm } from "../withdraw/withdraw-form";
import { SendForm } from "../send/send-form";
import { TransferForm } from "../transfer/transfer-form";

export const metadata = { title: "Move money — Trustline Financial Group" };

const TABS = ["send", "deposit", "withdraw", "between"] as const;
type Tab = (typeof TABS)[number];

function isTab(value: unknown): value is Tab {
  return typeof value === "string" && (TABS as readonly string[]).includes(value);
}

export default async function TransfersPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; method?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (isAdmin(user.role)) redirect("/admin");
  if (user.status === "PENDING") redirect("/onboarding");
  if (user.status !== "ACTIVE") redirect("/login");

  const t = await getDict();
  const locale = await getLocale();
  const params = await searchParams;
  const tab: Tab = isTab(params.tab) ? params.tab : "send";
  const methodParam = params.method;

  const portfolio = await loadPortfolio(user.id);
  const available = portfolio.primary.availableCents;

  // Only the methods an admin has enabled for this flow and account type.
  const methods = (
    await db.depositMethod.findMany({
      where: {
        enabled: true,
        ...(tab === "withdraw" ? { forWithdrawal: true } : { forDeposit: true }),
      },
      orderBy: { sortOrder: "asc" },
    })
  ).filter((m) => methodVisibleFor(m.accountTypes, user.accountType));

  const selected = methodParam ? methods.find((m) => m.key === methodParam) : undefined;

  const tabLabels: Record<Tab, string> = {
    send: t.transfers.tabSend,
    deposit: t.transfers.tabDeposit,
    withdraw: t.transfers.tabWithdraw,
    between: t.transfers.tabBetween,
  };

  // Between-accounts only makes sense once a savings account exists.
  const visibleTabs = TABS.filter((key) => key !== "between" || portfolio.savings);

  const securityWordMissing = !user.securityWordHash;

  return (
    <AppShell
      user={user}
      active="transfers"
      title={t.transfers.title}
      subtitle={t.transfers.subtitle}
    >
      <Page className="max-w-3xl space-y-5">
        {/* Available balance */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200/80 bg-white px-5 py-4">
          <div>
            <Eyebrow className="text-gray-500">{t.bank.available}</Eyebrow>
            <p className="tnum mt-1 text-2xl font-semibold tracking-tight text-navy-900">
              {formatMoney(available, locale, portfolio.currency)}
            </p>
          </div>
          <p className="tnum font-mono text-[12px] text-gray-400">{portfolio.primary.number}</p>
        </div>

        <Tabs
          items={visibleTabs.map((key) => ({
            key,
            href: `/transfers?tab=${key}`,
            label: tabLabels[key],
            active: key === tab,
          }))}
        />

        <Card>
          {/* ---- Send to another Trustline client ---- */}
          {tab === "send" && (
            <>
              <h2 className="text-lg font-semibold tracking-tight text-navy-900">{t.send.title}</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-gray-600">{t.send.body}</p>
              {securityWordMissing ? (
                <SecurityWordPrompt t={t} />
              ) : (
                <SendForm
                  labels={{
                    recipient: t.send.recipient,
                    recipientHint: t.send.recipientHint,
                    amount: t.bank.amount,
                    securityWord: t.bank.securityWordField,
                    submit: t.send.submit,
                    submitting: t.send.submitting,
                  }}
                />
              )}
            </>
          )}

          {/* ---- Deposit ---- */}
          {tab === "deposit" && (
            <>
              <h2 className="text-lg font-semibold tracking-tight text-navy-900">
                {t.bank.depositTitle}
              </h2>
              {!selected ? (
                <>
                  <p className="mt-2 text-[15px] leading-relaxed text-gray-600">
                    {t.bank.chooseMethod}
                  </p>
                  <MethodGrid methods={methods} tab="deposit" />
                  <RequestMethod
                    labels={{
                      prompt: t.bank.methodRequestPrompt,
                      placeholder: t.bank.methodRequestPlaceholder,
                      send: t.bank.methodRequestSend,
                      sent: t.bank.methodRequestSent,
                    }}
                  />
                </>
              ) : (
                <>
                  <SelectedMethod label={selected.label} iconKey={selected.key} tab="deposit" changeLabel={t.bank.chooseMethod} />

                  {(selected.routeName ||
                    selected.routeIdentifier ||
                    selected.routeInstitution ||
                    selected.routeInstructions) && (
                    <div className="mt-4 rounded-xl border border-accent-100 bg-accent-50/60 p-4 text-sm">
                      <p className="font-semibold text-navy-900">{t.bank.depositRoute}</p>
                      <p className="mt-1 text-gray-600">{t.bank.depositRouteHint}</p>
                      <dl className="mt-3 space-y-1.5 text-navy-800">
                        {selected.routeName && (
                          <div className="flex justify-between gap-4">
                            <dt className="text-gray-500">{t.bank.routeName}</dt>
                            <dd className="font-semibold">{selected.routeName}</dd>
                          </div>
                        )}
                        {selected.routeIdentifier && (
                          <div className="flex justify-between gap-4">
                            <dt className="text-gray-500">{t.bank.routeIdentifier}</dt>
                            <dd className="tnum font-semibold">{selected.routeIdentifier}</dd>
                          </div>
                        )}
                        {selected.routeInstitution && (
                          <div className="flex justify-between gap-4">
                            <dt className="text-gray-500">{t.bank.routeInstitution}</dt>
                            <dd className="font-semibold">{selected.routeInstitution}</dd>
                          </div>
                        )}
                      </dl>
                      {selected.routeInstructions && (
                        <p className="mt-3 whitespace-pre-line text-gray-600">
                          {selected.routeInstructions}
                        </p>
                      )}
                    </div>
                  )}

                  <p className="mt-6 text-[15px] leading-relaxed text-gray-600">
                    {t.bank.depositBody}
                  </p>
                  <DepositForm
                    methodKey={selected.key}
                    labels={{
                      amount: t.bank.amount,
                      note: t.bank.note,
                      proof: t.bank.proof,
                      proofHint: t.bank.proofHint,
                      submit: t.bank.submitDeposit,
                      submitting: t.bank.submittingDeposit,
                      chooseFile: t.common.chooseFile,
                      noFile: t.common.noFileChosen,
                      optimising: t.common.optimising,
                      fileTooBig: t.common.fileTooBigPicked,
                    }}
                  />
                </>
              )}
            </>
          )}

          {/* ---- Withdraw ---- */}
          {tab === "withdraw" && (
            <>
              <h2 className="text-lg font-semibold tracking-tight text-navy-900">
                {t.bank.withdrawTitle}
              </h2>
              {!selected ? (
                <>
                  <p className="mt-2 text-[15px] leading-relaxed text-gray-600">
                    {t.bank.chooseMethod}
                  </p>
                  <MethodGrid methods={methods} tab="withdraw" />
                </>
              ) : (
                <>
                  <SelectedMethod label={selected.label} iconKey={selected.key} tab="withdraw" changeLabel={t.bank.chooseMethod} />
                  <p className="mt-6 text-[15px] leading-relaxed text-gray-600">
                    {t.bank.withdrawBody}
                  </p>
                  {securityWordMissing ? (
                    <SecurityWordPrompt t={t} />
                  ) : (
                    <WithdrawForm
                      methodKey={selected.key}
                      labels={{
                        amount: t.bank.amount,
                        details: t.bank.withdrawDetailsLabel,
                        detailsHint: t.bank.withdrawDetailsHint,
                        securityWord: t.bank.securityWordField,
                        submit: t.bank.submitWithdraw,
                        submitting: t.bank.submittingWithdraw,
                      }}
                    />
                  )}
                </>
              )}
            </>
          )}

          {/* ---- Between own accounts ---- */}
          {tab === "between" && portfolio.savings && (
            <>
              <h2 className="text-lg font-semibold tracking-tight text-navy-900">
                {t.bank.transferTitle}
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed text-gray-600">
                {t.bank.transferBody}
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-navy-50/70 p-4">
                  <p className="text-gray-500">{t.bank.checking}</p>
                  <p className="tnum mt-1 text-lg font-semibold text-navy-900">
                    {formatMoney(portfolio.primary.balanceCents, locale, portfolio.currency)}
                  </p>
                </div>
                <div className="rounded-xl bg-navy-50/70 p-4">
                  <p className="text-gray-500">{t.bank.savings}</p>
                  <p className="tnum mt-1 text-lg font-semibold text-navy-900">
                    {formatMoney(portfolio.savings.balanceCents, locale, portfolio.currency)}
                  </p>
                </div>
              </div>
              <TransferForm
                labels={{
                  toSavings: t.bank.toSavings,
                  toChecking: t.bank.toChecking,
                  amount: t.bank.amount,
                  submit: t.bank.transfer,
                }}
              />
            </>
          )}
        </Card>
      </Page>
    </AppShell>
  );
}

function MethodGrid({
  methods,
  tab,
}: {
  methods: { key: string; label: string }[];
  tab: Tab;
}) {
  return (
    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
      {methods.map((m) => (
        <Link
          key={m.key}
          href={`/transfers?tab=${tab}&method=${m.key}`}
          className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 p-4 text-center transition hover:border-accent-500/50 hover:bg-navy-50/50"
        >
          <span className="text-navy-700">
            <PaymentIcon icon={methodDef(m.key).icon} className="h-7 w-7" />
          </span>
          <span className="text-[13px] font-semibold text-navy-800">{m.label}</span>
        </Link>
      ))}
    </div>
  );
}

function SelectedMethod({
  label,
  iconKey,
  tab,
  changeLabel,
}: {
  label: string;
  iconKey: string;
  tab: Tab;
  changeLabel: string;
}) {
  return (
    <div className="mt-4 flex items-center gap-3 rounded-xl bg-navy-50/70 p-4">
      <span className="text-navy-700">
        <PaymentIcon icon={methodDef(iconKey).icon} className="h-7 w-7" />
      </span>
      <span className="font-semibold text-navy-900">{label}</span>
      <Link
        href={`/transfers?tab=${tab}`}
        className="ml-auto text-xs font-semibold text-accent-600 hover:text-accent-700"
      >
        {changeLabel}
      </Link>
    </div>
  );
}

function SecurityWordPrompt({ t }: { t: { bank: { securityWordMissing: string; goToAccount: string } } }) {
  return (
    <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
      {t.bank.securityWordMissing}
      <Link
        href="/account/security"
        className="mt-3 inline-block rounded-xl bg-navy-800 px-5 py-2 text-xs font-bold text-white transition hover:bg-navy-700"
      >
        {t.bank.goToAccount}
      </Link>
    </div>
  );
}
