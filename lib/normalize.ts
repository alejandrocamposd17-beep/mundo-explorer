/** Forma cruda del dataset público mledoze/countries (fuente original de REST Countries). */
export type RawCountry = {
  name: { common: string; official: string };
  cca2: string;
  cca3: string;
  unMember?: boolean;
  independent?: boolean;
  tld?: string[];
  idd?: { root?: string; suffixes?: string[] };
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
  independent: boolean;
  tld?: string;
  callingCode?: string;
  badges: string[];
  flagPng: string;
  flagSvg: string;
};

/** Código ISO 3166-1 alpha-3: exactamente 3 letras. */
export const COUNTRY_CODE_REGEX = /^[A-Za-z]{3}$/;
const CCA2_REGEX = /^[A-Za-z]{2}$/;

export const REGION_ES: Record<string, string> = {
  Africa: "África",
  Americas: "América",
  Antarctic: "Antártida",
  Asia: "Asia",
  Europe: "Europa",
  Oceania: "Oceanía",
};

export const SUBREGION_ES: Record<string, string> = {
  "Australia and New Zealand": "Australia y Nueva Zelanda",
  Caribbean: "Caribe",
  "Central America": "Centroamérica",
  "Central Asia": "Asia Central",
  "Central Europe": "Europa Central",
  "Eastern Africa": "África Oriental",
  "Eastern Asia": "Asia Oriental",
  "Eastern Europe": "Europa Oriental",
  "Middle Africa": "África Central",
  Melanesia: "Melanesia",
  Micronesia: "Micronesia",
  "North America": "Norteamérica",
  "Northern Africa": "África del Norte",
  "Northern Europe": "Europa del Norte",
  Polynesia: "Polinesia",
  "South America": "Sudamérica",
  "South-Eastern Asia": "Sudeste Asiático",
  "Southeast Europe": "Europa del Sudeste",
  "Southern Africa": "África Austral",
  "Southern Asia": "Asia del Sur",
  "Southern Europe": "Europa del Sur",
  "Western Africa": "África Occidental",
  "Western Asia": "Asia Occidental",
  "Western Europe": "Europa Occidental",
};

const languageNames = new Intl.DisplayNames(["es"], { type: "language" });
const currencyNames = new Intl.DisplayNames(["es"], { type: "currency" });

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Traduce un idioma (código ISO 639-3) al español; si no hay traducción usa el nombre original. */
export function translateLanguage(code: string, fallback: string): string {
  try {
    const name = languageNames.of(code);
    return name && name.toLowerCase() !== code.toLowerCase() ? capitalize(name) : fallback;
  } catch {
    return fallback;
  }
}

/** Traduce una moneda (código ISO 4217) al español conservando el símbolo. */
export function translateCurrency(code: string, fallback: string, symbol?: string): string {
  let name = fallback;
  try {
    const translated = currencyNames.of(code);
    if (translated && translated.toUpperCase() !== code.toUpperCase()) name = capitalize(translated);
  } catch {
    // código no reconocido: se usa el nombre original
  }
  return symbol ? `${name} (${symbol})` : name;
}

/** Prefijo telefónico: "+503". Si hay varios sufijos (ej. +1 en Norteamérica) se muestra solo la raíz. */
export function formatCallingCode(idd?: RawCountry["idd"]): string | undefined {
  const root = idd?.root;
  if (!root || !/^\+\d{1,4}$/.test(root)) return undefined;
  const suffixes = (idd?.suffixes ?? []).filter((s) => /^\d{1,4}$/.test(s));
  return suffixes.length === 1 ? `${root}${suffixes[0]}` : root;
}

/** Etiquetas descriptivas que se muestran en las tarjetas. */
export function computeBadges(c: Pick<RawCountry, "landlocked" | "borders" | "unMember" | "independent">): string[] {
  const badges: string[] = [];
  if (c.landlocked) badges.push("Sin litoral");
  else if ((c.borders ?? []).length === 0) badges.push("Sin fronteras terrestres");
  if (c.unMember) badges.push("ONU");
  if (c.independent === false) badges.push("Territorio");
  return badges;
}

export function normalizeCountry(c: RawCountry): Country {
  const cca2 = CCA2_REGEX.test(c.cca2) ? c.cca2.toLowerCase() : "un";
  const latlng =
    Array.isArray(c.latlng) && c.latlng.length === 2 && c.latlng.every((n) => Number.isFinite(n))
      ? (c.latlng as [number, number])
      : undefined;
  return {
    cca3: c.cca3,
    cca2,
    name: c.translations?.spa?.common ?? c.name.common,
    officialName: c.translations?.spa?.official ?? c.name.official,
    region: REGION_ES[c.region] ?? c.region,
    subregion: c.subregion ? (SUBREGION_ES[c.subregion] ?? c.subregion) : undefined,
    capital: c.capital?.[0],
    area: c.area,
    languages: Object.entries(c.languages ?? {}).map(([code, name]) => translateLanguage(code, name)),
    currencies: Object.entries(c.currencies ?? {}).map(([code, m]) => translateCurrency(code, m.name, m.symbol)),
    latlng,
    borders: c.borders ?? [],
    landlocked: Boolean(c.landlocked),
    unMember: Boolean(c.unMember),
    independent: c.independent !== false,
    tld: c.tld?.find((t) => /^\.[a-z0-9.-]{1,20}$/i.test(t)),
    callingCode: formatCallingCode(c.idd),
    badges: computeBadges(c),
    flagPng: `https://flagcdn.com/w320/${cca2}.png`,
    flagSvg: `https://flagcdn.com/${cca2}.svg`,
  };
}
