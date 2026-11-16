"use client";

import { useEffect, useMemo, useState } from "react";
import CountryCard from "./CountryCard";

export type ExplorerCountry = {
  cca3: string;
  name: string;
  flag: string;
  flagAlt?: string;
  region: string;
  capital?: string;
  population: number;
};

type SortKey = "name" | "population-desc" | "population-asc";

const PAGE_SIZE = 24;

function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export default function CountryExplorer({ countries }: { countries: ExplorerCountry[] }) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [region, setRegion] = useState("Todas");
  const [sort, setSort] = useState<SortKey>("name");
  const [visible, setVisible] = useState(PAGE_SIZE);

  // Debounce de la búsqueda para no recalcular en cada tecla
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), 250);
    return () => clearTimeout(id);
  }, [query]);

  // Reiniciar paginación cuando cambian los filtros
  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [debouncedQuery, region, sort]);

  const regions = useMemo(
    () => ["Todas", ...Array.from(new Set(countries.map((c) => c.region))).sort()],
    [countries],
  );

  const filtered = useMemo(() => {
    const q = normalize(debouncedQuery.trim());
    const list = countries.filter((c) => {
      const matchesRegion = region === "Todas" || c.region === region;
      const matchesQuery =
        q === "" || normalize(c.name).includes(q) || normalize(c.capital ?? "").includes(q);
      return matchesRegion && matchesQuery;
    });
    return [...list].sort((a, b) => {
      if (sort === "population-desc") return b.population - a.population;
      if (sort === "population-asc") return a.population - b.population;
      return a.name.localeCompare(b.name, "es");
    });
  }, [countries, debouncedQuery, region, sort]);

  return (
    <div>
      <div className="mb-6 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm sm:col-span-1">
          <span className="text-slate-400">Buscar</span>
          <input
            type="search"
            value={query}
            maxLength={60}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="País o capital…"
            className="rounded-lg border border-white/15 bg-slate-900 px-3 py-2 outline-none focus:border-brand-400"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-400">Región</span>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="rounded-lg border border-white/15 bg-slate-900 px-3 py-2 outline-none focus:border-brand-400"
          >
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-400">Ordenar por</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-lg border border-white/15 bg-slate-900 px-3 py-2 outline-none focus:border-brand-400"
          >
            <option value="name">Nombre (A–Z)</option>
            <option value="population-desc">Población (mayor a menor)</option>
            <option value="population-asc">Población (menor a mayor)</option>
          </select>
        </label>
      </div>

      <p className="mb-4 text-sm text-slate-400" aria-live="polite">
        {filtered.length} resultado{filtered.length === 1 ? "" : "s"}
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center text-slate-400">
          No encontramos países con esos filtros.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.slice(0, visible).map((c) => (
            <CountryCard key={c.cca3} {...c} />
          ))}
        </div>
      )}

      {visible < filtered.length && (
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="rounded-xl bg-brand-600 px-5 py-3 font-semibold hover:bg-brand-500"
          >
            Cargar más
          </button>
        </div>
      )}
    </div>
  );
}
