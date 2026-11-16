import type { Metadata } from "next";
import CountryMap, { type MapPoint } from "@/components/CountryMap";
import { getAllCountries } from "@/lib/countries";
import { fmt } from "@/lib/i18n/config";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.nav.map };
}

export default async function MapPage() {
  const { locale, t } = await getI18n();
  const countries = await getAllCountries(locale);
  const points: MapPoint[] = countries
    .filter((c) => c.latlng)
    .map((c) => ({
      lat: c.latlng![0],
      lng: c.latlng![1],
      label: c.name,
      href: `/paises/${c.cca3.toLowerCase()}`,
    }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">{t.map.title}</h1>
        <p className="mt-2 text-slate-400">{fmt(t.map.subtitle, { n: points.length })}</p>
      </div>
      <CountryMap points={points} center={[20, 0]} zoom={2} height="h-[70vh]" />
    </div>
  );
}
