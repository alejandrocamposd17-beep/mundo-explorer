"use client";

import Link from "next/link";
import type { BadgeKey } from "@/lib/normalize";
import { intlLocale } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/client";

type Props = {
  cca3: string;
  name: string;
  flag: string;
  flagAlt?: string;
  region: string;
  capital?: string;
  area: number;
  badges?: BadgeKey[];
  /** Imagen visible al cargar (LCP): se descarga de inmediato en vez de en diferido. */
  priority?: boolean;
};

const BADGE_STYLES: Record<BadgeKey, string> = {
  landlocked: "bg-amber-400/90 text-slate-900",
  noLandBorders: "bg-sky-400/90 text-slate-900",
  un: "bg-blue-600/90 text-white",
  territory: "bg-slate-900/80 text-white",
};

export default function CountryCard({ cca3, name, flag, flagAlt, region, capital, area, badges = [], priority = false }: Props) {
  const { locale, t } = useI18n();
  const fmt = new Intl.NumberFormat(intlLocale(locale));
  return (
    <Link
      href={`/paises/${cca3.toLowerCase()}`}
      className="group block h-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:-translate-y-1 hover:border-brand-400/60 hover:bg-white/10 hover:shadow-xl hover:shadow-brand-700/10"
    >
      <div className="relative aspect-[3/2] overflow-hidden bg-slate-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={flag}
          alt={flagAlt || name}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          width={320}
          height={213}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {badges.length > 0 && (
          <ul className="force-dark absolute bottom-2 left-2 flex flex-wrap gap-1">
            {badges.map((b) => (
              <li key={b} className={`rounded-full px-2 py-0.5 text-[11px] font-semibold shadow ${BADGE_STYLES[b]}`}>
                {t.badges[b]}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="p-4">
        <h3 className="truncate font-semibold">{name}</h3>
        <dl className="mt-2 space-y-1 text-sm text-slate-400">
          <div className="flex justify-between gap-2">
            <dt>{t.card.region}</dt>
            <dd className="text-slate-200">{region || "—"}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt>{t.card.capital}</dt>
            <dd className="truncate text-slate-200">{capital || "—"}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt>{t.card.area}</dt>
            <dd className="text-slate-200">
              {fmt.format(area)} {t.common.km2}
            </dd>
          </div>
        </dl>
      </div>
    </Link>
  );
}
