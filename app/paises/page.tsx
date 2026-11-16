import type { Metadata } from "next";
import CountryExplorer, { type ExplorerCountry } from "@/components/CountryExplorer";
import { getAllCountries } from "@/lib/countries";

export const metadata: Metadata = { title: "Países" };

export default async function CountriesPage() {
  const countries = await getAllCountries();

  // Solo enviamos al cliente los campos necesarios (payload más liviano)
  const data: ExplorerCountry[] = countries.map((c) => ({
    cca3: c.cca3,
    name: c.name.common,
    flag: c.flags.png,
    flagAlt: c.flags.alt,
    region: c.region,
    capital: c.capital?.[0],
    population: c.population,
  }));

  return (
    <div>
      <h1 className="text-3xl font-bold">Países del mundo</h1>
      <p className="mt-2 mb-6 text-slate-400">Busca, filtra por región y ordena por población.</p>
      <CountryExplorer countries={data} />
    </div>
  );
}
