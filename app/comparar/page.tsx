import type { Metadata } from "next";
import Link from "next/link";
import CompareSelector from "@/components/CompareSelector";
import { COUNTRY_CODE_REGEX, getAllCountries, numberFormatter, type Country } from "@/lib/countries";
import { haversineKm, timeDifferenceHours } from "@/lib/geo";
import { getCapitalLocation } from "@/lib/geocoding";
import { fmt } from "@/lib/i18n/config";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.compare.title };
}

type Props = { searchParams: Promise<{ a?: string | string[]; b?: string | string[] }> };

function pickCode(value: string | string[] | undefined) {
  const v = Array.isArray(value) ? value[0] : value;
  return v && COUNTRY_CODE_REGEX.test(v) ? v.toUpperCase() : undefined;
}

async function locate(c: Country) {
  const loc = c.capital ? await getCapitalLocation(c.capital, c.cca2) : null;
  return { coords: loc?.coords ?? c.latlng, timezone: loc?.timezone };
}

export default async function ComparePage({ searchParams }: Props) {
  const params = await searchParams;
  const { locale, t } = await getI18n();
  const nf = numberFormatter(locale);
  const codeA = pickCode(params.a);
  const codeB = pickCode(params.b);
  const countries = await getAllCountries(locale);
  const a = countries.find((c) => c.cca3 === codeA);
  const b = countries.find((c) => c.cca3 === codeB);
  const options = countries.map((c) => ({ cca3: c.cca3, name: c.name }));

  const rows: { label: string; get: (c: Country) => string }[] = [
    { label: t.detail.capital, get: (c) => c.capital ?? "—" },
    { label: t.detail.region, get: (c) => [c.region, c.subregion].filter(Boolean).join(" · ") },
    { label: t.detail.area, get: (c) => `${nf.format(c.area)} ${t.common.km2}` },
    { label: t.detail.languages, get: (c) => c.languages.join(", ") || "—" },
    { label: t.detail.currencies, get: (c) => c.currencies.join(", ") || "—" },
    { label: t.compare.borderCount, get: (c) => String(c.borders.length) },
    { label: t.detail.calling, get: (c) => c.callingCode ?? "—" },
    { label: t.detail.sea, get: (c) => (c.landlocked ? t.common.no : t.common.yes) },
    { label: t.detail.un, get: (c) => (c.unMember ? t.common.yes : t.common.no) },
  ];

  let sizeText: string | null = null;
  let distanceKm: number | null = null;
  let timeText: string | null = null;

  if (a && b) {
    if (a.area > 0 && b.area > 0) {
      const [big, small] = a.area >= b.area ? [a, b] : [b, a];
      const ratio = big.area / small.area;
      sizeText =
        ratio < 1.05
          ? fmt(t.compare.sameSize, { a: big.name, b: small.name })
          : fmt(t.compare.bigger, { a: big.name, b: small.name, x: nf.format(Math.round(ratio * 10) / 10) });
    }
    const [la, lb] = await Promise.all([locate(a), locate(b)]);
    if (la.coords && lb.coords) distanceKm = Math.round(haversineKm(la.coords, lb.coords));
    if (la.timezone && lb.timezone) {
      const diff = timeDifferenceHours(la.timezone, lb.timezone);
      const h = nf.format(Math.abs(diff));
      timeText =
        diff === 0
          ? t.compare.sameTime
          : diff > 0
            ? fmt(t.compare.ahead, { a: a.name, b: b.name, h })
            : fmt(t.compare.ahead, { a: b.name, b: a.name, h });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t.compare.title}</h1>
        <p className="mt-2 text-slate-400">{t.compare.subtitle}</p>
      </div>

      <CompareSelector key={`${codeA}-${codeB}`} options={options} a={a?.cca3} b={b?.cca3} />

      {a && b ? (
        <>
          <div className="grid gap-3 md:grid-cols-3">
            {sizeText && (
              <p className="rounded-xl border border-brand-400/30 bg-brand-500/10 p-4 text-center">📐 {sizeText}</p>
            )}
            {distanceKm !== null && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                <p className="text-xs uppercase tracking-wide text-slate-400">{t.compare.distance}</p>
                <p className="mt-1 font-display text-2xl font-bold">✈️ {nf.format(distanceKm)} km</p>
                <p className="text-xs text-slate-400">{fmt(t.compare.distanceValue, { km: nf.format(distanceKm) })}</p>
              </div>
            )}
            {timeText && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                <p className="text-xs uppercase tracking-wide text-slate-400">{t.compare.timeDiff}</p>
                <p className="mt-1 font-display text-lg font-bold">🕒 {timeText}</p>
              </div>
            )}
          </div>
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="bg-white/5">
                <tr>
                  <th className="p-3 font-medium text-slate-400">{t.compare.data}</th>
                  {[a, b].map((c) => (
                    <th key={c.cca3} className="p-3">
                      <Link href={`/paises/${c.cca3.toLowerCase()}`} className="flex items-center gap-2 font-semibold hover:underline">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={c.flagPng} alt="" className="h-5 w-8 rounded-sm object-cover" />
                        {c.name}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className="border-t border-white/10">
                    <th scope="row" className="p-3 font-medium text-slate-400">
                      {row.label}
                    </th>
                    <td className="p-3">{row.get(a)}</td>
                    <td className="p-3">{row.get(b)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center text-slate-400">
          {t.compare.empty}
        </div>
      )}
    </div>
  );
}
