import type { Metadata } from "next";
import CountryMap, { type MapPoint } from "@/components/CountryMap";
import { getAllCountries } from "@/lib/countries";

export const metadata: Metadata = { title: "Mapa" };

export default async function MapPage() {
  const countries = await getAllCountries();
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
        <h1 className="text-3xl font-bold">Mapa del mundo</h1>
        <p className="mt-2 text-slate-400">
          {points.length} países en el mapa. Pasa el cursor sobre un punto para ver el nombre y haz clic para abrir el
          detalle.
        </p>
      </div>
      <CountryMap points={points} center={[20, 0]} zoom={2} height="h-[70vh]" />
    </div>
  );
}
