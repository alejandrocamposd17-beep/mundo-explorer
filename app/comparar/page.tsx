import type { Metadata } from "next";
import Link from "next/link";
import CompareSelector from "@/components/CompareSelector";
import { COUNTRY_CODE_REGEX, getAllCountries, numberFmt, type Country } from "@/lib/countries";

export const metadata: Metadata = { title: "Comparar países" };

type Props = { searchParams: Promise<{ a?: string | string[]; b?: string | string[] }> };

function pickCode(value: string | string[] | undefined) {
  const v = Array.isArray(value) ? value[0] : value;
  return v && COUNTRY_CODE_REGEX.test(v) ? v.toUpperCase() : undefined;
}

const ROWS: { label: string; get: (c: Country) => string }[] = [
  { label: "Capital", get: (c) => c.capital ?? "—" },
  { label: "Región", get: (c) => [c.region, c.subregion].filter(Boolean).join(" · ") },
  { label: "Área", get: (c) => `${numberFmt.format(c.area)} km²` },
  { label: "Idiomas", get: (c) => c.languages.join(", ") || "—" },
  { label: "Monedas", get: (c) => c.currencies.join(", ") || "—" },
  { label: "Países fronterizos", get: (c) => String(c.borders.length) },
  { label: "Salida al mar", get: (c) => (c.landlocked ? "No" : "Sí") },
  { label: "Miembro de la ONU", get: (c) => (c.unMember ? "Sí" : "No") },
];

export default async function ComparePage({ searchParams }: Props) {
  const params = await searchParams;
  const codeA = pickCode(params.a);
  const codeB = pickCode(params.b);
  const countries = await getAllCountries();
  const a = countries.find((c) => c.cca3 === codeA);
  const b = countries.find((c) => c.cca3 === codeB);
  const options = countries.map((c) => ({ cca3: c.cca3, name: c.name }));

  const ratio = a && b && a.area > 0 && b.area > 0 ? Math.max(a.area, b.area) / Math.min(a.area, b.area) : null;
  const bigger = a && b ? (a.area >= b.area ? a : b) : null;
  const smaller = a && b ? (a.area >= b.area ? b : a) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Comparar países</h1>
        <p className="mt-2 text-slate-400">Elige dos países para verlos lado a lado.</p>
      </div>

      <CompareSelector key={`${codeA}-${codeB}`} options={options} a={a?.cca3} b={b?.cca3} />

      {a && b ? (
        <>
          {ratio && bigger && smaller && (
            <p className="rounded-xl border border-brand-400/30 bg-brand-500/10 p-4 text-center">
              <strong>{bigger.name}</strong> es{" "}
              {ratio < 1.05 ? "casi del mismo tamaño que" : `${numberFmt.format(Math.round(ratio * 10) / 10)} veces más grande que`}{" "}
              <strong>{smaller.name}</strong>.
            </p>
          )}
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="bg-white/5">
                <tr>
                  <th className="p-3 font-medium text-slate-400">Dato</th>
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
                {ROWS.map((row) => (
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
          Selecciona dos países para ver la comparación.
        </div>
      )}
    </div>
  );
}
