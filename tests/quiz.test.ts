import { describe, expect, it } from "vitest";
import { buildQuestion, shuffle, type QuizItem } from "../lib/quiz";

const items: QuizItem[] = [
  { cca3: "SLV", name: "El Salvador", capital: "San Salvador", flag: "f", region: "América" },
  { cca3: "GTM", name: "Guatemala", capital: "Ciudad de Guatemala", flag: "f", region: "América" },
  { cca3: "HND", name: "Honduras", capital: "Tegucigalpa", flag: "f", region: "América" },
  { cca3: "NIC", name: "Nicaragua", capital: "Managua", flag: "f", region: "América" },
  { cca3: "CRI", name: "Costa Rica", capital: "San José", flag: "f", region: "América" },
  { cca3: "ATA", name: "Antártida", capital: undefined, flag: "f", region: "Antártida" },
];

/** Generador pseudoaleatorio determinista para que los tests sean reproducibles. */
function seeded(seed: number) {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

describe("shuffle", () => {
  it("conserva todos los elementos sin modificar el original", () => {
    const original = [1, 2, 3, 4, 5];
    const result = shuffle(original, seeded(1));
    expect([...result].sort()).toEqual(original);
    expect(original).toEqual([1, 2, 3, 4, 5]);
  });
});

describe("buildQuestion", () => {
  it("genera 4 opciones únicas que incluyen la respuesta correcta", () => {
    for (let s = 1; s < 30; s++) {
      const q = buildQuestion(items, (i) => i.capital, seeded(s))!;
      expect(q.options).toHaveLength(4);
      expect(new Set(q.options).size).toBe(4);
      expect(q.options).toContain(q.answer);
      expect(q.answer).toBe(q.item.capital);
    }
  });

  it("ignora países sin respuesta (por ejemplo sin capital)", () => {
    for (let s = 1; s < 30; s++) {
      expect(buildQuestion(items, (i) => i.capital, seeded(s))!.item.cca3).not.toBe("ATA");
    }
  });

  it("devuelve null si no hay suficientes opciones", () => {
    expect(buildQuestion(items.slice(0, 3), (i) => i.name)).toBeNull();
  });
});
