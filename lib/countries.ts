import "server-only";
import type { Locale } from "./i18n/config";
import { COUNTRY_CODE_REGEX, normalizeCountry, type Country, type RawCountry } from "./normalize";

export type { BadgeKey, Country } from "./normalize";
export { COUNTRY_CODE_REGEX } from "./normalize";

const DATA_URL =
  process.env.COUNTRIES_API_URL ?? "https://raw.githubusercontent.com/mledoze/countries/master/dist/countries.json";

async function getRawCountries(): Promise<RawCountry[]> {
  const res = await fetch(DATA_URL, { next: { revalidate: 86400 } });
  if (!res.ok) {
    throw new Error(`No se pudo obtener la lista de países (HTTP ${res.status}).`);
  }
  const data: unknown = await res.json();
  if (!Array.isArray(data)) {
    throw new Error("La API de países devolvió una respuesta inesperada.");
  }
  return (data as RawCountry[]).filter((c) => c && typeof c.cca3 === "string" && c.name?.common);
}

export async function getAllCountries(locale: Locale = "es"): Promise<Country[]> {
  const raw = await getRawCountries();
  const collator = locale === "es" ? "es" : "en";
  return raw.map((c) => normalizeCountry(c, locale)).sort((a, b) => a.name.localeCompare(b.name, collator));
}

export async function getCountryByCode(code: string, locale: Locale = "es"): Promise<Country | null> {
  if (!COUNTRY_CODE_REGEX.test(code)) return null;
  const upper = code.toUpperCase();
  const all = await getAllCountries(locale);
  return all.find((c) => c.cca3 === upper) ?? null;
}

export async function getCountryNames(
  codes: string[],
  locale: Locale = "es",
): Promise<{ cca3: string; name: string }[]> {
  const wanted = new Set(codes.filter((c) => COUNTRY_CODE_REGEX.test(c)));
  if (wanted.size === 0) return [];
  const all = await getAllCountries(locale);
  return all.filter((c) => wanted.has(c.cca3)).map((c) => ({ cca3: c.cca3, name: c.name }));
}

export function numberFormatter(locale: Locale = "es") {
  return new Intl.NumberFormat(locale === "en" ? "en-US" : "es-SV");
}

/** Compatibilidad: formateador en español. */
export const numberFmt = numberFormatter("es");
