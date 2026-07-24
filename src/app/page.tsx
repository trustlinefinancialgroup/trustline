import Image from "next/image";
import Link from "next/link";
import { getDict, getLocale } from "@/i18n/server";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Logo } from "@/components/logo";

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
        <Image
          src="/images/hero-city.jpg"
          alt=""
          fill
          priority
          className="object-cover opacity-25"
        />
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
            <p className="mt-6 text-lg leading-relaxed text-navy-100">
              {t.landing.heroBody}
            </p>
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
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-600">
              {t.landing.personal.kicker}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-navy-900 sm:text-4xl">
              {t.landing.personal.title}
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-gray-600">
              {t.landing.personal.body}
            </p>
          </div>
          <Link
            href="/signup"
            className="rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-navy-800"
          >
            {t.landing.getStarted}
          </Link>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {t.landing.personal.items.map((p) => (
            <Link
              key={p.title}
              href="/signup"
              className="group rounded-2xl border border-gray-200 bg-white p-7 transition hover:border-accent-500/40 hover:shadow-lg hover:shadow-navy-900/5"
            >
              <div className="h-1.5 w-8 rounded-full bg-accent-500 transition group-hover:w-12" />
              <h3 className="mt-5 text-[17px] font-semibold text-navy-900">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{p.body}</p>
            </Link>
          ))}
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
            {t.landing.commercial.items.map((p) => (
              <Link
                key={p.title}
                href="/signup"
                className="group rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-accent-500/50 hover:bg-white/10"
              >
                <div className="h-1.5 w-8 rounded-full bg-accent-500 transition group-hover:w-12" />
                <h3 className="mt-4 font-semibold text-white">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-200">{p.body}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Trustline */}
      <section id="why" className="bg-navy-50/60">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 py-24 lg:grid-cols-2">
          <div className="relative order-2 h-[420px] overflow-hidden rounded-2xl lg:order-1">
            <Image
              src="/images/advisor-meeting.jpg"
              alt="Meeting with a Trustline advisor"
              fill
              className="object-cover"
            />
          </div>
          <div className="order-1 lg:order-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-600">
              {t.landing.whyKicker}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-navy-900 sm:text-4xl">
              {t.landing.whyTitle}
            </h2>
            <div className="mt-10 space-y-8">
              {t.landing.pillars.map((f) => (
                <div key={f.title} className="flex gap-5">
                  <div className="mt-1 h-10 w-10 shrink-0 rounded-full bg-accent-50 text-center text-lg leading-10 text-accent-600">
                    ✓
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy-900">{f.title}</h3>
                    <p className="mt-1 text-[15px] leading-relaxed text-gray-600">
                      {f.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
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
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-4">
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
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto max-w-7xl px-6 py-6 text-xs text-navy-400">
            &copy; {new Date().getFullYear()} Trustline Financial Group. {t.landing.footerRights}
          </div>
        </div>
      </footer>
    </main>
  );
}
