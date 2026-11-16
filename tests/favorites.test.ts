import { describe, expect, it } from "vitest";
import { sanitizeFavorites } from "../lib/favorites";

const valid = { cca3: "SLV", name: "El Salvador", flag: "https://flagcdn.com/w320/sv.png", region: "América" };

describe("sanitizeFavorites", () => {
  it("conserva favoritos válidos", () => {
    expect(sanitizeFavorites([valid])).toEqual([valid]);
  });

  it("descarta datos manipulados o con forma incorrecta", () => {
    expect(
      sanitizeFavorites([
        valid,
        { ...valid, cca3: "slv; drop" },
        { ...valid, flag: "javascript:alert(1)" },
        { ...valid, name: "x".repeat(500) },
        null,
        "texto",
        42,
      ]),
    ).toEqual([valid]);
  });

  it("devuelve una lista vacía si no es un arreglo", () => {
    expect(sanitizeFavorites({ cca3: "SLV" })).toEqual([]);
    expect(sanitizeFavorites(null)).toEqual([]);
  });

  it("limita la cantidad de favoritos", () => {
    expect(sanitizeFavorites(Array.from({ length: 150 }, () => valid))).toHaveLength(100);
  });
});
