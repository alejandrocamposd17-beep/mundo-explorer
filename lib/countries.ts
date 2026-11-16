import "server-only";

export type CountrySummary = {
  cca3: string;
  name: { common: string; official: string };
  flags: { png: string; svg: string; alt?: string };
  region: string;
  population: number;
  capital?: string[];
};

export type CountryDetail = CountrySummary & {
  subregion?: string;
  area: number;
  languages?: Record<string, string>;
  currencies?: Record<string, { name: string; symbol?: string }>;
  latlng?: [number, number];
  capitalInfo?: { latlng?: [number, number] };
  borders?: string[];
  timezones?: string[];
  maps?: { googleMaps?: string };
  translations?: Record<string, { common: string; official: string }>;
};

const BASE_URL = process.env.COUNTRIES_API_URL ?? "https://restcountries.com/v3.1";

/** Código ISO 3166-1 alpha-3: exactamente 3 letras. */
export const COUNTRY_CODE_REGEX = /^[A-Za-z]{3}$/;

export function displayName(c: { name: { common: string }; translations?: CountryDetail["translations"] }) {
  return c.translations?.spa?.common ?? c.name.common;
}

export async function getAllCountries(): Promise<CountrySummary[]> {
  const url = new URL(`${BASE_URL}/all`);
  url.searchParams.set("fields", "cca3,name,flags,region,population,capital,translations");
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) {
    throw new Error(`No se pudo obtener la lista de países (HTTP ${res.status}).`);
  }
  const data = (await res.json()) as CountryDetail[];
  return data
    .map((c) => ({ ...c, name: { ...c.name, common: displayName(c) } }))
    .sort((a, b) => a.name.common.localeCompare(b.name.common, "es"));
}

export async function getCountryByCode(code: string): Promise<CountryDetail | null> {
  if (!COUNTRY_CODE_REGEX.test(code)) return null;
  const url = new URL(`${BASE_URL}/alpha/${encodeURIComponent(code.toUpperCase())}`);
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (res.status === 404 || res.status === 400) return null;
  if (!res.ok) {
    throw new Error(`No se pudo obtener el país (HTTP ${res.status}).`);
  }
  const data = (await res.json()) as CountryDetail | CountryDetail[];
  const country = Array.isArray(data) ? data[0] : data;
  return country ?? null;
}

export async function getCountryNames(codes: string[]): Promise<{ cca3: string; name: string }[]> {
  const valid = codes.filter((c) => COUNTRY_CODE_REGEX.test(c)).slice(0, 20);
  if (valid.length === 0) return [];
  const url = new URL(`${BASE_URL}/alpha`);
  url.searchParams.set("codes", valid.join(","));
  url.searchParams.set("fields", "cca3,name,translations");
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) return valid.map((c) => ({ cca3: c, name: c }));
  const data = (await res.json()) as CountryDetail[];
  return data.map((c) => ({ cca3: c.cca3, name: displayName(c) }));
}

export const numberFmt = new Intl.NumberFormat("es-SV");
