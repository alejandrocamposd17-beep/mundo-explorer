import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { getAllCountries, numberFormatter, type Country } from "@/lib/countries";
import { fmt } from "@/lib/i18n/config";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.rankings.title };
}

const MEDALS = ["🥇", "🥈", "🥉"];

export default async function RankingsPage() {
  const { locale, t } = await getI18n();
  const nf = numberFormatter(locale);
  const countries = (await getAllCountries(locale)).filter((c) => c.area > 0);

  const top = (sorter: (a: Country, b: Country) => number) => [...countries].sort(sorter).slice(0, 10);
  const lists: { title: string; icon: string; items: Country[]; value: (c: Country) => string }[] = [
    {
      title: t.rankings.largest,
      icon: "🌍",
      items: top((a, b) => b.area - a.area),
      value: (c) => `${nf.format(c.area)} ${t.common.km2}`,
    },
    {
      title: t.rankings.smallest,
      icon: "🔎",
      items: top((a, b) => a.area - b.area),
      value: (c) => `${nf.format(c.area)} ${t.common.km2}`,
    },
    {
      title: t.rankings.mostBorders,
      icon: "🧭",
      items: top((a, b) => b.borders.length - a.borders.length || a.name.localeCompare(b.name, locale)),
      value: (c) => fmt(t.rankings.bordersUnit, { n: c.borders.length }),
    },
    {
      title: t.rankings.mostLanguages,
      icon: "🗣️",
      items: top((a, b) => b.languages.length - a.languages.length || a.name.localeCompare(b.name, locale)),
      value: (c) => fmt(t.rankings.languagesUnit, { n: c.languages.length }),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t.rankings.title}</h1>
        <p className="mt-2 text-slate-400">{t.rankings.subtitle}</p>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {lists.map((list, li) => (
          <Reveal key={list.title} delay={(li % 2) * 100}>
            <section className="h-full rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="mb-4 text-xl font-bold">
                <span aria-hidden>{list.icon}</span> {list.title}
              </h2>
              <ol className="space-y-1.5">
                {list.items.map((c, i) => (
                  <li key={c.cca3}>
                    <Link
                      href={`/paises/${c.cca3.toLowerCase()}`}
                      className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition hover:bg-white/10"
                    >
                      <span className="w-7 text-center font-display font-bold text-slate-400">{MEDALS[i] ?? i + 1}</span>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={c.flagPng} alt="" loading="lazy" className="h-5 w-8 rounded-sm object-cover" />
                      <span className="flex-1 truncate font-medium">{c.name}</span>
                      <span className="text-sm tabular-nums text-slate-400">{list.value(c)}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
