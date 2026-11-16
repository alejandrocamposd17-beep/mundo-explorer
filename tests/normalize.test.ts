import { describe, expect, it } from "vitest";
import {
  computeBadges,
  formatCallingCode,
  normalizeCountry,
  translateCurrency,
  translateLanguage,
  type RawCountry,
} from "../lib/normalize";

const raw: RawCountry = {
  name: { common: "El Salvador", official: "Republic of El Salvador" },
  cca2: "SV",
  cca3: "SLV",
  unMember: true,
  currencies: { USD: { name: "United States dollar", symbol: "$" } },
  capital: ["San Salvador"],
  region: "Americas",
  subregion: "Central America",
  languages: { spa: "Spanish" },
  translations: { spa: { official: "República de El Salvador", common: "El Salvador" } },
  latlng: [13.83333333, -88.91666666],
  landlocked: false,
  borders: ["GTM", "HND"],
  area: 21041,
};

describe("normalizeCountry", () => {
  const c = normalizeCountry(raw);

  it("usa los nombres en español", () => {
    expect(c.name).toBe("El Salvador");
    expect(c.officialName).toBe("República de El Salvador");
  });

  it("traduce región y subregión", () => {
    expect(c.region).toBe("América");
    expect(c.subregion).toBe("Centroamérica");
  });

  it("traduce idiomas y monedas", () => {
    expect(c.languages).toEqual(["Español"]);
    expect(c.currencies[0]).toMatch(/^Dólar estadounidense \(\$\)$/);
  });

  it("genera URLs de bandera seguras a partir del código ISO", () => {
    expect(c.flagPng).toBe("https://flagcdn.com/w320/sv.png");
    expect(c.flagSvg).toBe("https://flagcdn.com/sv.svg");
  });

  it("no confía en un cca2 malformado", () => {
    const bad = normalizeCountry({ ...raw, cca2: "../evil" });
    expect(bad.flagPng).toBe("https://flagcdn.com/w320/un.png");
  });

  it("descarta coordenadas inválidas", () => {
    const bad = normalizeCountry({ ...raw, latlng: [Number.NaN, 0] });
    expect(bad.latlng).toBeUndefined();
  });
});

describe("traducciones con respaldo", () => {
  it("usa el nombre original si el código no se reconoce", () => {
    expect(translateLanguage("zzz", "Lengua X")).toBe("Lengua X");
    expect(translateCurrency("ZZZ", "Moneda X")).toBe("Moneda X");
  });
});

describe("datos adicionales", () => {
  it("formatea el prefijo telefónico", () => {
    expect(formatCallingCode({ root: "+5", suffixes: ["03"] })).toBe("+503");
    expect(formatCallingCode({ root: "+1", suffixes: ["201", "202"] })).toBe("+1");
    expect(formatCallingCode({ root: "javascript:" })).toBeUndefined();
    expect(formatCallingCode(undefined)).toBeUndefined();
  });

  it("calcula las insignias del país", () => {
    expect(computeBadges({ landlocked: true, borders: ["X"], unMember: true })).toEqual(["landlocked", "un"]);
    expect(computeBadges({ landlocked: false, borders: [], unMember: false, independent: false })).toEqual([
      "noLandBorders",
      "territory",
    ]);
  });

  it("solo acepta dominios de internet con formato válido", () => {
    expect(normalizeCountry({ ...raw, tld: [".sv"] }).tld).toBe(".sv");
    expect(normalizeCountry({ ...raw, tld: ["<b>x</b>"] }).tld).toBeUndefined();
  });
});

describe("idioma inglés", () => {
  const c = normalizeCountry(raw, "en");

  it("usa nombres y regiones en inglés", () => {
    expect(c.name).toBe("El Salvador");
    expect(c.officialName).toBe("Republic of El Salvador");
    expect(c.region).toBe("Americas");
    expect(c.subregion).toBe("Central America");
  });

  it("traduce idiomas y monedas al inglés", () => {
    expect(c.languages).toEqual(["Spanish"]);
    expect(c.currencies[0]).toBe("US Dollar ($)");
    expect(c.languageCodes).toEqual(["spa"]);
  });
});
