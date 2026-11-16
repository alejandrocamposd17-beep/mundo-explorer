import type { Metadata } from "next";
import CountryExplorer, { type ExplorerCountry, type LanguageOption } from "@/components/CountryExplorer";
import { getAllCountries } from "@/lib/countries";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.nav.countries };
}

export default async function CountriesPage() {
  const { locale, t } = await getI18n();
  const countries = await getAllCountries(locale);

  // Solo enviamos al cliente los campos necesarios (payload más liviano)
  const data: ExplorerCountry[] = countries.map((c) => ({
    cca3: c.cca3,
    name: c.name,
    flag: c.flagPng,
    region: c.region,
    capital: c.capital,
    area: c.area,
    badges: c.badges,
    languageCodes: c.languageCodes,
    landlocked: c.landlocked,
    unMember: c.unMember,
  }));

  // Idiomas para el filtro: nombre traducido y cuántos países lo hablan (los que aparecen en 2+ países)
  const langMap = new Map<string, LanguageOption>();
  for (const c of countries) {
    c.languageCodes.forEach((code, i) => {
      const entry = langMap.get(code) ?? { code, name: c.languages[i] ?? code, count: 0 };
      entry.count += 1;
      langMap.set(code, entry);
    });
  }
  const languages = [...langMap.values()]
    .filter((l) => l.count >= 2)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, locale));

  return (
    <div>
      <h1 className="text-3xl font-bold">{t.countries.title}</h1>
      <p className="mt-2 mb-6 text-slate-400">{t.countries.subtitle}</p>
      <CountryExplorer countries={data} languages={languages} />
    </div>
  );
}
