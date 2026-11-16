import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CountryMap from "@/components/CountryMap";
import FavoriteButton from "@/components/FavoriteButton";
import LocalClock from "@/components/LocalClock";
import ShareButton from "@/components/ShareButton";
import WeatherWidget from "@/components/WeatherWidget";
import { getCountryByCode, getCountryNames, numberFormatter } from "@/lib/countries";
import { getCapitalLocation } from "@/lib/geocoding";
import { fmt } from "@/lib/i18n/config";
import { getI18n } from "@/lib/i18n/server";
import { getWikiSummary } from "@/lib/wikipedia";

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const { locale, t } = await getI18n();
  const country = await getCountryByCode(code, locale);
  if (!country) return { title: t.detail.notFound };
  const description = fmt(t.detail.metaDescription, {
    name: country.name,
    capital: country.capital ?? "—",
    region: country.region,
    area: numberFormatter(locale).format(country.area),
  });
  return {
    title: country.name,
    description,
    openGraph: { title: `${country.name} · Mundo Explorer`, description },
  };
}

export default async function CountryDetailPage({ params }: Props) {
  const { code } = await params;
  const { locale, t } = await getI18n();
  const country = await getCountryByCode(code, locale);
  if (!country) notFound();

  const nf = numberFormatter(locale);
  const [borders, capitalLocation, wiki] = await Promise.all([
    getCountryNames(country.borders, locale),
    country.capital ? getCapitalLocation(country.capital, country.cca2) : Promise.resolve(null),
    getWikiSummary(country.name, locale),
  ]);
  // Clima y mapa en la capital; si no se encuentra, en el centro geográfico del país
  const capitalCoords = capitalLocation?.coords ?? null;
  const coords = capitalCoords ?? country.latlng;
  const place = capitalCoords && country.capital ? `${country.capital}, ${country.name}` : country.name;
  const mapsUrl = coords
    ? `https://www.google.com/maps/@${encodeURIComponent(coords[0])},${encodeURIComponent(coords[1])},${capitalCoords ? 11 : 6}z`
    : null;

  const facts = [
    { label: t.detail.officialName, value: country.officialName },
    { label: t.detail.capital, value: country.capital ?? "—" },
    { label: t.detail.region, value: [country.region, country.subregion].filter(Boolean).join(" · ") },
    { label: t.detail.area, value: `${nf.format(country.area)} ${t.common.km2}` },
    { label: t.detail.languages, value: country.languages.join(", ") || "—" },
    { label: t.detail.currencies, value: country.currencies.join(", ") || "—" },
    { label: t.detail.sea, value: country.landlocked ? t.detail.seaNo : t.common.yes },
    { label: t.detail.un, value: country.unMember ? t.common.yes : t.common.no },
    { label: t.detail.calling, value: country.callingCode ?? "—" },
    { label: t.detail.tld, value: country.tld ?? "—" },
    { label: t.detail.iso, value: `${country.cca2.toUpperCase()} · ${country.cca3}` },
    { label: t.detail.status, value: country.independent ? t.detail.independent : t.detail.dependent },
  ];

  return (
    <div className="relative space-y-8">
      {/* Brillo de fondo con los colores de la bandera: la misma imagen, muy desenfocada */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={country.flagPng}
        alt=""
        aria-hidden
        width={320}
        height={213}
        className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[420px] w-[120%] max-w-none -translate-x-1/2 scale-110 object-cover opacity-25 blur-3xl"
      />
      <Link href="/paises" className="inline-block rounded-lg bg-slate-900/80 px-2 py-1 text-sm text-brand-400 hover:underline">
        {t.detail.back}
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4 self-start">
          <div className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={country.flagSvg} alt={country.name} width={640} height={427} className="block h-auto w-full" />
          </div>
          {capitalLocation?.timezone && (
            <LocalClock timeZone={capitalLocation.timezone} place={country.capital ?? country.name} />
          )}
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <h1 className="text-4xl font-bold sm:text-5xl">{country.name}</h1>
              {country.badges.length > 0 && (
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {country.badges.map((b) => (
                    <li key={b} className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-xs text-slate-300">
                      {t.badges[b]}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/comparar?a=${country.cca3.toLowerCase()}`}
                className="rounded-xl border border-white/20 px-4 py-2 font-semibold hover:bg-white/10"
              >
                {t.detail.compare}
              </Link>
              <FavoriteButton
                country={{ cca3: country.cca3, name: country.name, flag: country.flagPng, region: country.region }}
              />
              <ShareButton name={country.name} path={`/paises/${country.cca3.toLowerCase()}`} />
            </div>
          </div>

          <dl className="grid gap-3 sm:grid-cols-2">
            {facts.map((f) => (
              <div key={f.label} className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
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
              className="inline-block rounded-lg border border-white/15 bg-slate-900 px-3 py-1.5 text-sm font-medium text-slate-100 hover:bg-white/10"
            >
              {t.detail.maps}
            </a>
          )}
        </div>
      </div>

      {wiki && (
        <section className="grid gap-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm md:grid-cols-[240px_1fr]">
          {wiki.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={wiki.image.src}
              alt={country.name}
              width={wiki.image.width}
              height={wiki.image.height}
              loading="lazy"
              className="h-48 w-full rounded-xl object-cover md:h-full"
            />
          )}
          <div className={wiki.image ? "" : "md:col-span-2"}>
            <h2 className="text-xl font-bold">{fmt(t.detail.aboutTitle, { name: country.name })}</h2>
            <p className="mt-3 leading-relaxed text-slate-300">{wiki.extract}</p>
            <p className="mt-3 text-xs text-slate-400">
              {t.detail.wikiSource} ·{" "}
              <a href={wiki.url} target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:underline">
                {t.detail.readMore}
              </a>
            </p>
          </div>
        </section>
      )}

      {coords && <WeatherWidget lat={coords[0]} lon={coords[1]} place={place} />}

      {coords && (
        <section>
          <h2 className="mb-3 text-xl font-bold">{t.detail.location}</h2>
          <CountryMap
            points={[{ lat: coords[0], lng: coords[1], label: place }]}
            center={coords}
            zoom={capitalCoords ? 6 : 4}
          />
        </section>
      )}

      {borders.length > 0 && (
        <section>
          <h2 className="mb-3 text-xl font-bold">{t.detail.borders}</h2>
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
