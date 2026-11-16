import { describe, expect, it } from "vitest";
import { aqiLevel, computeAlerts, describeWeather, type DailyForecast } from "../lib/weather";

const day = (over: Partial<DailyForecast>): DailyForecast => ({
  date: "2026-11-16",
  weatherCode: 0,
  max: 25,
  min: 15,
  precipitationProbability: 10,
  windMax: 10,
  ...over,
});

describe("computeAlerts", () => {
  it("no genera alertas con clima normal", () => {
    expect(computeAlerts([day({})])).toEqual([]);
  });

  it("detecta calor, lluvia, tormenta, viento y frío", () => {
    const kinds = computeAlerts([
      day({ max: 38 }),
      day({ precipitationProbability: 90 }),
      day({ weatherCode: 95 }),
      day({ windMax: 70 }),
      day({ min: -15 }),
    ]).map((a) => a.kind);
    expect(kinds).toEqual(["heat", "rain", "storm", "wind", "cold"]);
  });

  it("limita la cantidad de alertas", () => {
    expect(computeAlerts(Array.from({ length: 10 }, () => day({ max: 40 })))).toHaveLength(6);
  });
});

describe("aqiLevel", () => {
  it("clasifica el índice de calidad del aire", () => {
    expect(aqiLevel(20)).toBe(0);
    expect(aqiLevel(80)).toBe(1);
    expect(aqiLevel(120)).toBe(2);
    expect(aqiLevel(180)).toBe(3);
    expect(aqiLevel(250)).toBe(4);
    expect(aqiLevel(400)).toBe(5);
  });
});

describe("describeWeather", () => {
  it("usa la etiqueta del diccionario y un ícono", () => {
    expect(describeWeather(0, { "0": "Despejado" })).toEqual({ icon: "☀️", label: "Despejado" });
    expect(describeWeather(999, { unknown: "Desconocido" }).label).toBe("Desconocido");
  });
});
