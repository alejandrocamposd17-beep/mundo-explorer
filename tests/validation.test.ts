import { describe, expect, it } from "vitest";
import { parseCoord, parseLat, parseLon } from "../lib/validation";

describe("parseCoord", () => {
  it("acepta coordenadas válidas y las redondea a 3 decimales", () => {
    expect(parseLat("13.69412")).toBe(13.694);
    expect(parseLon("-89.2182")).toBe(-89.218);
  });

  it("acepta los límites exactos", () => {
    expect(parseLat("90")).toBe(90);
    expect(parseLat("-90")).toBe(-90);
    expect(parseLon("180")).toBe(180);
  });

  it("rechaza valores fuera de rango", () => {
    expect(parseLat("90.1")).toBeNull();
    expect(parseLon("-181")).toBeNull();
  });

  it("rechaza entradas vacías, nulas o no numéricas", () => {
    expect(parseCoord(null, -90, 90)).toBeNull();
    expect(parseCoord("", -90, 90)).toBeNull();
    expect(parseCoord("   ", -90, 90)).toBeNull();
    expect(parseCoord("abc", -90, 90)).toBeNull();
    expect(parseCoord("NaN", -90, 90)).toBeNull();
    expect(parseCoord("Infinity", -90, 90)).toBeNull();
  });

  it("rechaza entradas sospechosamente largas", () => {
    expect(parseCoord("1".padEnd(25, "0"), -90, 90)).toBeNull();
    expect(parseCoord("<script>alert(1)</script>", -90, 90)).toBeNull();
  });
});
