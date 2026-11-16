import type { Metadata } from "next";
import Link from "next/link";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.games.title };
}

export default async function GamesPage() {
  const { t } = await getI18n();
  const games = [
    { href: "/juegos/banderas", icon: "🏳️", title: t.games.flagsTitle, desc: t.games.flagsDesc },
    { href: "/juegos/capitales", icon: "🏛️", title: t.games.capitalsTitle, desc: t.games.capitalsDesc },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t.games.title}</h1>
        <p className="mt-2 text-slate-400">{t.games.subtitle}</p>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {games.map((g) => (
          <Link
            key={g.href}
            href={g.href}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-brand-700/40 to-indigo-700/30 p-8 transition hover:-translate-y-1 hover:border-brand-400/60"
          >
            <span className="text-5xl" aria-hidden>
              {g.icon}
            </span>
            <h2 className="mt-4 text-2xl font-bold">{g.title}</h2>
            <p className="mt-2 text-slate-300">{g.desc}</p>
            <span className="mt-6 inline-block rounded-xl bg-brand-600 px-5 py-2.5 font-semibold text-[#fff] group-hover:bg-brand-500">
              {t.games.play} →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
