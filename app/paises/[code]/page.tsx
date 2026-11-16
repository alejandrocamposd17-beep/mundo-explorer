import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import FavoriteButton from "@/components/FavoriteButton";
import WeatherWidget from "@/components/WeatherWidget";
import { getCountryByCode, getCountryNames, numberFmt } from "@/lib/countries";

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const country = await getCountryByCode(code);
  return { title: country ? country.name : "País no encontrado" };
}

export default async function CountryDetailPage({ params }: Props) {
  const { code } = await params;
  const country = await getCountryByCode(code);
  if (!country) notFound();

  const borders = await getCountryNames(country.borders);
  const coords = country.latlng;
  const mapsUrl = coords
    ? `https://www.google.com/maps/@${encodeURIComponent(coords[0])},${encodeURIComponent(coords[1])},6z`
    : null;

  const facts = [
    { label: "Nombre oficial", value: country.officialName },
    { label: "Capital", value: country.capital ?? "—" },
    { label: "Región", value: [country.region, country.subregion].filter(Boolean).join(" · ") },
    { label: "Área", value: `${numberFmt.format(country.area)} km²` },
    { label: "Idiomas", value: country.languages.join(", ") || "—" },
    { label: "Monedas", value: country.currencies.join(", ") || "—" },
    { label: "Salida al mar", value: country.landlocked ? "No (sin litoral)" : "Sí" },
    { label: "Miembro de la ONU", value: country.unMember ? "Sí" : "No" },
  ];

  return (
    <div className="space-y-8">
      <Link href="/paises" className="text-sm text-brand-400 hover:underline">
        ← Volver a países
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={country.flagSvg} alt={`Bandera de ${country.name}`} className="w-full object-cover" />
        </div>

        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-4xl font-extrabold">{country.name}</h1>
            <FavoriteButton
              country={{ cca3: country.cca3, name: country.name, flag: country.flagPng, region: country.region }}
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

      {coords && <WeatherWidget lat={coords[0]} lon={coords[1]} place={country.name} />}

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
