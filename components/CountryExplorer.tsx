"use client";

import { useEffect, useMemo, useState } from "react";
import type { BadgeKey } from "@/lib/normalize";
import { ALL, filterCountries, type SortKey } from "@/lib/filter";
import { fmt } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/client";
import CountryCard from "./CountryCard";

export type ExplorerCountry = {
  cca3: string;
  name: string;
  flag: string;
  flagAlt?: string;
  region: string;
  capital?: string;
  area: number;
  badges: BadgeKey[];
  languageCodes: string[];
  landlocked: boolean;
  unMember: boolean;
};

export type LanguageOption = { code: string; name: string; count: number };

const PAGE_SIZE = 24;

export default function CountryExplorer({
  countries,
  languages,
}: {
  countries: ExplorerCountry[];
  languages: LanguageOption[];
}) {
  const { locale, t } = useI18n();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [region, setRegion] = useState(ALL);
  const [language, setLanguage] = useState(ALL);
  const [sort, setSort] = useState<SortKey>("name");
  const [landlockedOnly, setLandlockedOnly] = useState(false);
  const [unOnly, setUnOnly] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);

  // Debounce de la búsqueda para no recalcular en cada tecla
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), 250);
    return () => clearTimeout(id);
  }, [query]);

  // Reiniciar paginación cuando cambian los filtros
  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [debouncedQuery, region, sort, language, landlockedOnly, unOnly]);

  const regions = useMemo(
    () => Array.from(new Set(countries.map((c) => c.region))).sort((a, b) => a.localeCompare(b, locale)),
    [countries, locale],
  );

  const filtered = useMemo(
    () =>
      filterCountries(countries, {
        query: debouncedQuery,
        region,
        sort,
        language,
        landlockedOnly,
        unOnly,
        collator: locale,
      }),
    [countries, debouncedQuery, region, sort, language, landlockedOnly, unOnly, locale],
  );

  const field = "rounded-lg border border-white/15 bg-slate-900 px-3 py-2 outline-none focus:border-brand-400";

  return (
    <div>
      <div className="mb-6 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-400">{t.countries.search}</span>
            <input
              type="search"
              value={query}
              maxLength={60}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.countries.searchPlaceholder}
              className={field}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-400">{t.countries.region}</span>
            <select value={region} onChange={(e) => setRegion(e.target.value)} className={field}>
              <option value={ALL}>{t.common.all}</option>
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-400">{t.countries.language}</span>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className={field}>
              <option value={ALL}>{t.countries.anyLanguage}</option>
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name} ({l.count})
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-400">{t.countries.sort}</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className={field}>
              <option value="name">{t.countries.sortName}</option>
              <option value="area-desc">{t.countries.sortAreaDesc}</option>
              <option value="area-asc">{t.countries.sortAreaAsc}</option>
            </select>
          </label>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={landlockedOnly}
              onChange={(e) => setLandlockedOnly(e.target.checked)}
              className="h-4 w-4 accent-brand-500"
            />
            {t.countries.landlockedOnly}
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={unOnly}
              onChange={(e) => setUnOnly(e.target.checked)}
              className="h-4 w-4 accent-brand-500"
            />
            {t.countries.unOnly}
          </label>
        </div>
      </div>

      <p className="mb-4 text-sm text-slate-400" aria-live="polite">
        {filtered.length === 1 ? t.countries.result : fmt(t.countries.results, { n: filtered.length })}
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center text-slate-400">
          {t.countries.noResults}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.slice(0, visible).map((c, i) => (
            <CountryCard
              key={c.cca3}
              cca3={c.cca3}
              name={c.name}
              flag={c.flag}
              region={c.region}
              capital={c.capital}
              area={c.area}
              badges={c.badges}
              priority={i < 4}
            />
          ))}
        </div>
      )}

      {visible < filtered.length && (
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="rounded-xl bg-brand-600 px-5 py-3 font-semibold text-[#fff] hover:bg-brand-500"
          >
            {t.countries.loadMore}
          </button>
        </div>
      )}
    </div>
  );
}
