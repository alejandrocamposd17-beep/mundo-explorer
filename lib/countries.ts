import "server-only";
import { COUNTRY_CODE_REGEX, normalizeCountry, type Country, type RawCountry } from "./normalize";

export type { Country } from "./normalize";
export { COUNTRY_CODE_REGEX } from "./normalize";

const DATA_URL =
  process.env.COUNTRIES_API_URL ?? "https://raw.githubusercontent.com/mledoze/countries/master/dist/countries.json";

export async function getAllCountries(): Promise<Country[]> {
  const res = await fetch(DATA_URL, { next: { revalidate: 86400 } });
  if (!res.ok) {
    throw new Error(`No se pudo obtener la lista de países (HTTP ${res.status}).`);
  }
  const data: unknown = await res.json();
  if (!Array.isArray(data)) {
    throw new Error("La API de países devolvió una respuesta inesperada.");
  }
  return (data as RawCountry[])
    .filter((c) => c && typeof c.cca3 === "string" && c.name?.common)
    .map(normalizeCountry)
    .sort((a, b) => a.name.localeCompare(b.name, "es"));
}

export async function getCountryByCode(code: string): Promise<Country | null> {
  if (!COUNTRY_CODE_REGEX.test(code)) return null;
  const upper = code.toUpperCase();
  const all = await getAllCountries();
  return all.find((c) => c.cca3 === upper) ?? null;
}

export async function getCountryNames(codes: string[]): Promise<{ cca3: string; name: string }[]> {
  const wanted = new Set(codes.filter((c) => COUNTRY_CODE_REGEX.test(c)));
  if (wanted.size === 0) return [];
  const all = await getAllCountries();
  return all.filter((c) => wanted.has(c.cca3)).map((c) => ({ cca3: c.cca3, name: c.name }));
}

export const numberFmt = new Intl.NumberFormat("es-SV");
