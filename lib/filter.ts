export type FilterableCountry = {
  name: string;
  capital?: string;
  region: string;
  area: number;
  languageCodes?: string[];
  landlocked?: boolean;
  unMember?: boolean;
};

export type SortKey = "name" | "area-desc" | "area-asc";

export type FilterOptions = {
  query?: string;
  region?: string;
  sort?: SortKey;
  language?: string;
  landlockedOnly?: boolean;
  unOnly?: boolean;
  collator?: string;
};

/** Valor que representa "todas las regiones" / "cualquier idioma". */
export const ALL = "all";

/** Minúsculas y sin tildes: "Perú" → "peru". */
export function normalizeText(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function filterCountries<T extends FilterableCountry>(countries: T[], options: FilterOptions): T[] {
  const {
    query = "",
    region = ALL,
    sort = "name",
    language = ALL,
    landlockedOnly = false,
    unOnly = false,
    collator = "es",
  } = options;
  const q = normalizeText(query.trim());
  const list = countries.filter((c) => {
    if (region !== ALL && region !== "Todas" && c.region !== region) return false;
    if (language !== ALL && !(c.languageCodes ?? []).includes(language)) return false;
    if (landlockedOnly && !c.landlocked) return false;
    if (unOnly && !c.unMember) return false;
    return q === "" || normalizeText(c.name).includes(q) || normalizeText(c.capital ?? "").includes(q);
  });
  return [...list].sort((a, b) => {
    if (sort === "area-desc") return b.area - a.area;
    if (sort === "area-asc") return a.area - b.area;
    return a.name.localeCompare(b.name, collator);
  });
}
