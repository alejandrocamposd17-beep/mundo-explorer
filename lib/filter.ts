export type FilterableCountry = {
  name: string;
  capital?: string;
  region: string;
  area: number;
};

export type SortKey = "name" | "area-desc" | "area-asc";

/** Minúsculas y sin tildes: "Perú" → "peru". */
export function normalizeText(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function filterCountries<T extends FilterableCountry>(
  countries: T[],
  { query = "", region = "Todas", sort = "name" }: { query?: string; region?: string; sort?: SortKey },
): T[] {
  const q = normalizeText(query.trim());
  const list = countries.filter((c) => {
    const matchesRegion = region === "Todas" || c.region === region;
    const matchesQuery =
      q === "" || normalizeText(c.name).includes(q) || normalizeText(c.capital ?? "").includes(q);
    return matchesRegion && matchesQuery;
  });
  return [...list].sort((a, b) => {
    if (sort === "area-desc") return b.area - a.area;
    if (sort === "area-asc") return a.area - b.area;
    return a.name.localeCompare(b.name, "es");
  });
}
