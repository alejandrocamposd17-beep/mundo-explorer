import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import FavoriteButton from "@/components/FavoriteButton";
import WeatherWidget from "@/components/WeatherWidget";
import { displayName, getCountryByCode, getCountryNames, numberFmt } from "@/lib/countries";

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const country = await getCountryByCode(code);
  return { title: country ? displayName(country) : "País no encontrado" };
}

export default async function CountryDetailPage({ params }: Props) {
  const { code } = await params;
  const country = await getCountryByCode(code);
  if (!country) notFound();

  const name = displayName(country);
  const borders = await getCountryNames(country.borders ?? []);
  const coords = country.capitalInfo?.latlng ?? country.latlng;
  const capital = country.capital?.[0];
  const languages = Object.values(country.languages ?? {});
  const currencies = Object.values(country.currencies ?? {}).map((c) => `${c.name}${c.symbol ? ` (${c.symbol})` : ""}`);
  const rawMapsUrl = country.maps?.googleMaps;
  // Solo se permiten enlaces https para evitar esquemas peligrosos (javascript:, data:)
  const mapsUrl = rawMapsUrl && rawMapsUrl.startsWith("https://") ? rawMapsUrl : null;

  const facts = [
    { label: "Nombre oficial", value: country.name.official },
    { label: "Capital", value: capital ?? "—" },
    { label: "Región", value: [country.region, country.subregion].filter(Boolean).join(" · ") },
    { label: "Población", value: numberFmt.format(country.population) },
    { label: "Área", value: `${numberFmt.format(country.area)} km²` },
    { label: "Idiomas", value: languages.join(", ") || "—" },
    { label: "Monedas", value: currencies.join(", ") || "—" },
    { label: "Zonas horarias", value: country.timezones?.join(", ") ?? "—" },
  ];

  return (
    <div className="space-y-8">
      <Link href="/paises" className="text-sm text-brand-400 hover:underline">
        ← Volver a países
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={country.flags.svg} alt={country.flags.alt || `Bandera de ${name}`} className="w-full object-cover" />
        </div>

        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-4xl font-extrabold">{name}</h1>
            <FavoriteButton
              country={{ cca3: country.cca3, name, flag: country.flags.png, region: country.region }}
            />
          </div>

          <dl className="grid gap-3 sm:grid-cols-2">
            {facts.map((f) => (
              <div key={f.label} className="rounded-xl border border-white/10 bg-white/5 p-3">
                <dt className="text-xs uppercase tracking-wide text-slate-400">{f.label}</dt>
                <dd className="mt-1 font-medium">{f.value}</dd>
              </div>
            ))}
          </dl>

          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm text-brand-400 hover:underline"
            >
              Ver en Google Maps ↗
            </a>
          )}
        </div>
      </div>

      {coords && <WeatherWidget lat={coords[0]} lon={coords[1]} place={capital ?? name} />}

      {borders.length > 0 && (
        <section>
          <h2 className="mb-3 text-xl font-bold">Países fronterizos</h2>
          <div className="flex flex-wrap gap-2">
            {borders.map((b) => (
              <Link
                key={b.cca3}
                href={`/paises/${b.cca3.toLowerCase()}`}
                className="rounded-full border border-white/15 px-3 py-1 text-sm hover:border-brand-400 hover:bg-white/10"
              >
                {b.name}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
