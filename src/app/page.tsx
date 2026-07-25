import Image from "next/image";
import Link from "next/link";
import { getDict, getLocale } from "@/i18n/server";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Logo } from "@/components/logo";
import { CardStack } from "@/components/card-stack";
import { Icons } from "@/components/icons";
import { ChatLauncher } from "@/components/chat-launcher";

const personalIcons = [Icons.card, Icons.savings, Icons.lending, Icons.mortgage, Icons.insurance];
const commercialIcons = [
  Icons.card,
  Icons.deposit,
  Icons.draft,
  Icons.checking,
  Icons.phone,
  Icons.money,
  Icons.business,
];
const benefitIcons = [Icons.review, Icons.statement, Icons.shield, Icons.globe, Icons.buildings, Icons.lending];

export default async function HomePage() {
  const t = await getDict();
  const locale = await getLocale();

  return (
    <main className="flex-1">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-navy-900/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Logo theme="dark" />
          <nav className="hidden items-center gap-8 text-sm font-medium text-navy-100 md:flex">
            <a href="#personal" className="hover:text-white">{t.nav.personal}</a>
            <a href="#commercial" className="hover:text-white">{t.nav.commercial}</a>
            <a href="#why" className="hover:text-white">{t.nav.why}</a>
            <a href="#contact" className="hover:text-white">{t.nav.contact}</a>
          </nav>
          <div className="flex items-center gap-3">
            <LanguageSwitcher current={locale} variant="dark" />
            <Link
              href="/login"
              className="hidden rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 sm:block"
            >
              {t.common.signIn}
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-accent-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-600"
            >
              {t.common.openAccount}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-navy-900">
        <Image src="/images/hero-city.jpg" alt="" fill priority className="object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-900/90 to-navy-900/40" />
        <div className="relative mx-auto max-w-7xl px-6 py-28 lg:py-36">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-navy-300">
              {t.landing.badge}
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-6xl">
              {t.landing.heroTitle1}
              <br />
              {t.landing.heroTitle2}
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-navy-100">{t.landing.heroBody}</p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/signup"
                className="rounded-full bg-accent-500 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-accent-700/30 transition hover:bg-accent-600"
              >
                {t.common.openAccount}
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-white/25 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                {t.common.signIn}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Personal banking */}
      <section id="personal" className="mx-auto max-w-7xl scroll-mt-16 px-6 py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-600">
              {t.landing.personal.kicker}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-navy-900 sm:text-4xl">
              {t.landing.personal.title}
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-gray-600">
              {t.landing.personal.body}
            </p>
            <Link
              href="/signup"
              className="mt-7 inline-block rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-navy-800"
            >
              {t.landing.getStarted}
            </Link>
          </div>
          <div className="rounded-3xl bg-navy-50/70 p-4">
            <CardStack className="h-auto w-full" />
          </div>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {t.landing.personal.items.map((p, i) => {
            const Icon = personalIcons[i];
            return (
              <Link
                key={p.title}
                href="/signup"
                className="group rounded-2xl border border-gray-200 bg-white p-7 transition hover:border-accent-500/40 hover:shadow-lg hover:shadow-navy-900/5"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-[17px] font-semibold text-navy-900">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{p.body}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Commercial banking */}
      <section id="commercial" className="scroll-mt-16 bg-navy-900">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-navy-300">
                {t.landing.commercial.kicker}
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {t.landing.commercial.title}
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-navy-200">
                {t.landing.commercial.body}
              </p>
            </div>
            <Link
              href="/signup"
              className="rounded-full bg-accent-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-600"
            >
              {t.landing.getStarted}
            </Link>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {t.landing.commercial.items.map((p, i) => {
              const Icon = commercialIcons[i];
              return (
                <Link
                  key={p.title}
                  href="/signup"
                  className="group rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-accent-500/50 hover:bg-white/10"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-accent-300">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 font-semibold text-white">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-navy-200">{p.body}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="why" className="mx-auto max-w-7xl scroll-mt-16 px-6 py-24">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-600">
            {t.landing.benefitsKicker}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-navy-900 sm:text-4xl">
            {t.landing.benefitsTitle}
          </h2>
        </div>
        <div className="mt-12 grid gap-10 lg:grid-cols-5 lg:items-stretch">
          <div className="relative order-last min-h-[320px] overflow-hidden rounded-3xl lg:order-first lg:col-span-2">
            <Image
              src="/images/advisor-meeting.jpg"
              alt="A Trustline advisor meeting with a client"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/40 to-transparent" />
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:col-span-3">
            {t.landing.benefits.map((f, i) => {
              const Icon = benefitIcons[i];
              return (
                <div key={f.title} className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
                    <Icon className="h-6 w-6" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-navy-900">{f.title}</h3>
                    <p className="mt-1.5 text-[15px] leading-relaxed text-gray-600">{f.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Welcome bonus */}
      <section className="mx-auto max-w-7xl px-6 pb-8">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-accent-600 to-navy-800 px-8 py-12 sm:px-12">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
            <Icons.gift className="h-4 w-4" />
            {t.landing.bonusBadge}
          </span>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/10 p-6">
              <Icons.gift className="h-7 w-7 text-white" />
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
                {t.landing.bonusTitle}
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed text-white/85">{t.landing.bonusBody}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-6">
              <Icons.checking className="h-7 w-7 text-white" />
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
                {t.landing.bonusRateTitle}
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed text-white/85">{t.landing.bonusRateBody}</p>
            </div>
          </div>
          <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-white/70">{t.landing.bonusTerms}</p>
            <Link
              href="/signup"
              className="rounded-full bg-white px-8 py-4 text-sm font-semibold text-navy-900 shadow-lg transition hover:bg-navy-50"
            >
              {t.common.openAccount}
            </Link>
          </div>
        </div>
      </section>

      {/* Team band */}
      <section className="relative isolate overflow-hidden">
        <Image
          src="/images/team.jpg"
          alt="The Trustline Financial Group team"
          fill
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950/90 via-navy-950/70 to-navy-900/40" />
        <div className="relative mx-auto max-w-7xl px-6 py-28 lg:py-36">
          <div className="max-w-xl">
            <h2 className="text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">
              {t.landing.whyTitle}
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-navy-100">
              {t.landing.footerTagline}
            </p>
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="bg-navy-900">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-6 py-20 text-center">
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {t.landing.ctaTitle1}
            <br />
            <span className="text-navy-300">{t.landing.ctaTitle2}</span>
          </h2>
          <Link
            href="/signup"
            className="rounded-full bg-accent-500 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-accent-700/30 transition hover:bg-accent-600"
          >
            {t.common.openAccount}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-navy-950 text-navy-200">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-5">
          <div className="md:col-span-2">
            <Logo theme="dark" href={null} />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-navy-300">
              {t.landing.footerTagline}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{t.landing.footerContact}</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a href="mailto:info@trustlinefinancialgroup.com" className="hover:text-white">
                  info@trustlinefinancialgroup.com
                </a>
              </li>
              <li>
                <a href="mailto:support@trustlinefinancialgroup.com" className="hover:text-white">
                  support@trustlinefinancialgroup.com
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{t.landing.footerClients}</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/login" className="hover:text-white">{t.common.signIn}</Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-white">{t.common.openAccount}</Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{t.landing.footerLegal}</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/legal/terms" className="hover:text-white">{t.legal.terms}</Link></li>
              <li><Link href="/legal/privacy" className="hover:text-white">{t.legal.privacy}</Link></li>
              <li><Link href="/legal/e-consent" className="hover:text-white">{t.legal.eConsent}</Link></li>
              <li><Link href="/legal/deposit-agreement" className="hover:text-white">{t.legal.depositAgreement}</Link></li>
            </ul>
          </div>
        </div>
        <ChatLauncher />
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-6 text-xs text-navy-400 sm:flex-row sm:items-center sm:justify-between">
            <span>
              &copy; {new Date().getFullYear()} Trustline Financial Group. {t.landing.footerRights}
            </span>
            <span className="flex items-center gap-2 text-navy-300">
              <span className="flex h-5 w-9 items-center justify-center rounded border border-navy-500 text-[9px] font-bold tracking-wide text-navy-200">
                FDIC
              </span>
              {t.bank.fdic}
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
