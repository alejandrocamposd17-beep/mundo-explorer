import { describe, expect, it } from "vitest";
import { haversineKm, timeDifferenceHours, timeZoneOffsetMinutes } from "../lib/geo";

describe("haversineKm", () => {
  it("calcula la distancia San Salvador – Ciudad de Guatemala (~180 km)", () => {
    const d = haversineKm([13.69, -89.19], [14.64, -90.51]);
    expect(d).toBeGreaterThan(170);
    expect(d).toBeLessThan(190);
  });

  it("es 0 para el mismo punto", () => {
    expect(haversineKm([10, 10], [10, 10])).toBe(0);
  });
});

describe("zonas horarias", () => {
  const date = new Date("2026-01-15T12:00:00Z");

  it("obtiene el desfase de El Salvador (UTC-6)", () => {
    expect(timeZoneOffsetMinutes("America/El_Salvador", date)).toBe(-360);
  });

  it("calcula la diferencia entre Tokio y San Salvador (15 h)", () => {
    expect(timeDifferenceHours("Asia/Tokyo", "America/El_Salvador", date)).toBe(15);
  });

  it("maneja zonas con media hora (India)", () => {
    expect(timeDifferenceHours("Asia/Kolkata", "UTC", date)).toBe(5.5);
  });
});
