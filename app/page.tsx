import Link from "next/link";
import CountUp from "@/components/CountUp";
import CountryCard from "@/components/CountryCard";
import Reveal from "@/components/Reveal";
import { getAllCountries } from "@/lib/countries";
import { fmt } from "@/lib/i18n/config";
import { getI18n } from "@/lib/i18n/server";

const FEATURED = ["SLV", "MEX", "JPN", "ESP", "BRA", "CAN"];
const HERO_FLAGS = [
  { code: "sv", className: "left-[4%] top-[14%] w-16 [--r:-8deg]", delay: "0s" },
  { code: "jp", className: "left-[12%] bottom-[12%] w-14 [--r:6deg]", delay: "1.2s" },
  { code: "br", className: "right-[6%] top-[12%] w-16 [--r:7deg]", delay: "0.6s" },
  { code: "ca", className: "right-[14%] bottom-[10%] w-14 [--r:-6deg]", delay: "1.8s" },
  { code: "es", className: "left-[24%] top-[6%] w-11 [--r:4deg] hidden md:block", delay: "2.4s" },
  { code: "mx", className: "right-[26%] top-[4%] w-11 [--r:-4deg] hidden md:block", delay: "3s" },
];

export default async function HomePage() {
  const { locale, t } = await getI18n();
  const countries = await getAllCountries(locale);
  const featured = countries.filter((c) => FEATURED.includes(c.cca3));
  const totalArea = Math.round(countries.reduce((acc, c) => acc + c.area, 0));
  const regions = new Set(countries.map((c) => c.region)).size;

  return (
    <div className="space-y-14">
      <section className="force-dark relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-indigo-700 px-6 py-16 text-center shadow-xl shadow-brand-700/30 sm:px-12 sm:py-20">
        {/* Fondo decorativo: patrón de puntos, globo girando y banderas flotantes */}
        <div className="dot-grid pointer-events-none absolute inset-0 -z-10 opacity-60" aria-hidden />
        <svg
          viewBox="0 0 200 200"
          className="animate-spin-slow pointer-events-none absolute -right-24 -bottom-24 -z-10 h-96 w-96 opacity-20"
          aria-hidden
        >
          <g fill="none" stroke="white" strokeWidth="1">
            <circle cx="100" cy="100" r="90" />
            <ellipse cx="100" cy="100" rx="45" ry="90" />
            <ellipse cx="100" cy="100" rx="75" ry="90" />
            <path d="M10 100h180M22 55h156M22 145h156" />
          </g>
        </svg>
        {HERO_FLAGS.map((f) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={f.code}
            src={`https://flagcdn.com/w160/${f.code}.png`}
            alt=""
            aria-hidden
            width={160}
            height={107}
            className={`animate-float pointer-events-none absolute -z-10 h-auto rounded-md opacity-40 shadow-lg ${f.className}`}
            style={{ animationDelay: f.delay }}
          />
        ))}

        <p className="text-sm uppercase tracking-[0.25em] text-brand-100">{t.home.eyebrow}</p>
        <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-bold sm:text-6xl">{t.home.title}</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-brand-50/90">{fmt(t.home.subtitle, { n: countries.length })}</p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link
            href="/paises"
            className="rounded-xl bg-white px-5 py-3 font-semibold text-brand-700 shadow-md transition hover:-translate-y-0.5 hover:bg-brand-50"
          >
            {t.home.explore}
          </Link>
          <Link
            href="/aleatorio"
            prefetch={false}
            className="rounded-xl border border-white/40 bg-white/10 px-5 py-3 font-semibold backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20"
          >
            🎲 {t.home.surprise}
          </Link>
        </div>
        <p className="mt-6 hidden text-xs text-brand-100/80 sm:block">
          {fmt(t.home.shortcut, { key: "Ctrl + K" })}
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { label: t.home.statCountries, value: countries.length },
          { label: t.home.statArea, value: totalArea },
          { label: t.home.statRegions, value: regions },
        ].map((s, i) => (
          <Reveal key={s.label} delay={i * 100}>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
              <p className="font-display text-3xl font-bold text-brand-400">
                <CountUp value={s.value} />
              </p>
              <p className="mt-1 text-sm text-slate-400">{s.label}</p>
            </div>
          </Reveal>
        ))}
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-2xl font-bold">{t.home.featured}</h2>
          <Link href="/paises" className="text-sm text-brand-400 hover:underline">
            {t.home.seeAll}
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((c, i) => (
            <Reveal key={c.cca3} delay={(i % 3) * 100}>
              <CountryCard
                cca3={c.cca3}
                name={c.name}
                flag={c.flagPng}
                region={c.region}
                capital={c.capital}
                area={c.area}
                badges={c.badges}
                priority={i < 3}
              />
            </Reveal>
          ))}
        </div>
      </section>

      <Reveal>
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.home.features.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className="group rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:-translate-y-1 hover:border-brand-400/60"
            >
              <span className="text-3xl" aria-hidden>
                {f.icon}
              </span>
              <h3 className="mt-3 text-lg font-bold group-hover:text-brand-400">{f.title}</h3>
              <p className="mt-1 text-sm text-slate-400">{f.text}</p>
            </Link>
          ))}
        </section>
      </Reveal>
    </div>
  );
}
