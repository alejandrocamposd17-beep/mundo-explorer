import "server-only";

/** Forma cruda del dataset público mledoze/countries (fuente original de REST Countries). */
type RawCountry = {
  name: { common: string; official: string };
  cca2: string;
  cca3: string;
  unMember?: boolean;
  currencies?: Record<string, { name: string; symbol?: string }>;
  capital?: string[];
  region: string;
  subregion?: string;
  languages?: Record<string, string>;
  translations?: Record<string, { official: string; common: string }>;
  latlng?: [number, number];
  landlocked?: boolean;
  borders?: string[];
  area: number;
};

/** Modelo normalizado que usa la app. */
export type Country = {
  cca3: string;
  cca2: string;
  name: string;
  officialName: string;
  region: string;
  subregion?: string;
  capital?: string;
  area: number;
  languages: string[];
  currencies: string[];
  latlng?: [number, number];
  borders: string[];
  landlocked: boolean;
  unMember: boolean;
  flagPng: string;
  flagSvg: string;
};

const DATA_URL =
  process.env.COUNTRIES_API_URL ?? "https://raw.githubusercontent.com/mledoze/countries/master/dist/countries.json";

/** Código ISO 3166-1 alpha-3: exactamente 3 letras. */
export const COUNTRY_CODE_REGEX = /^[A-Za-z]{3}$/;
const CCA2_REGEX = /^[A-Za-z]{2}$/;

const REGION_ES: Record<string, string> = {
  Africa: "África",
  Americas: "América",
  Antarctic: "Antártida",
  Asia: "Asia",
  Europe: "Europa",
  Oceania: "Oceanía",
};

function normalizeCountry(c: RawCountry): Country {
  const cca2 = CCA2_REGEX.test(c.cca2) ? c.cca2.toLowerCase() : "un";
  return {
    cca3: c.cca3,
    cca2,
    name: c.translations?.spa?.common ?? c.name.common,
    officialName: c.translations?.spa?.official ?? c.name.official,
    region: REGION_ES[c.region] ?? c.region,
    subregion: c.subregion,
    capital: c.capital?.[0],
    area: c.area,
    languages: Object.values(c.languages ?? {}),
    currencies: Object.values(c.currencies ?? {}).map((m) => `${m.name}${m.symbol ? ` (${m.symbol})` : ""}`),
    latlng: Array.isArray(c.latlng) && c.latlng.length === 2 ? c.latlng : undefined,
    borders: c.borders ?? [],
    landlocked: Boolean(c.landlocked),
    unMember: Boolean(c.unMember),
    flagPng: `https://flagcdn.com/w320/${cca2}.png`,
    flagSvg: `https://flagcdn.com/${cca2}.svg`,
  };
}

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
