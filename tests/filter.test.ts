import { describe, expect, it } from "vitest";
import { filterCountries, normalizeText } from "../lib/filter";

const countries = [
  { name: "Perú", capital: "Lima", region: "América", area: 1285216 },
  { name: "El Salvador", capital: "San Salvador", region: "América", area: 21041 },
  { name: "España", capital: "Madrid", region: "Europa", area: 505992 },
  { name: "Japón", capital: "Tokio", region: "Asia", area: 377930 },
];

describe("normalizeText", () => {
  it("quita tildes y pasa a minúsculas", () => {
    expect(normalizeText("Perú")).toBe("peru");
    expect(normalizeText("ESPAÑA")).toBe("espana");
  });
});

describe("filterCountries", () => {
  it("sin filtros devuelve todos ordenados por nombre", () => {
    expect(filterCountries(countries, {}).map((c) => c.name)).toEqual(["El Salvador", "España", "Japón", "Perú"]);
  });

  it("busca ignorando tildes y mayúsculas", () => {
    expect(filterCountries(countries, { query: "PERU" }).map((c) => c.name)).toEqual(["Perú"]);
  });

  it("busca también por capital", () => {
    expect(filterCountries(countries, { query: "tokio" }).map((c) => c.name)).toEqual(["Japón"]);
  });

  it("filtra por región", () => {
    expect(filterCountries(countries, { region: "América" })).toHaveLength(2);
  });

  it("ordena por área", () => {
    expect(filterCountries(countries, { sort: "area-desc" })[0].name).toBe("Perú");
    expect(filterCountries(countries, { sort: "area-asc" })[0].name).toBe("El Salvador");
  });

  it("no modifica el arreglo original", () => {
    const copy = [...countries];
    filterCountries(countries, { sort: "area-desc" });
    expect(countries).toEqual(copy);
  });
});
