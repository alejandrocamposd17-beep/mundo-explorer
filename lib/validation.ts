/**
 * Convierte un parámetro de texto en coordenada válida.
 * Devuelve null si no es numérico, está fuera de rango o es sospechosamente largo.
 */
export function parseCoord(value: string | null, min: number, max: number): number | null {
  if (value === null || value.trim() === "" || value.length > 20) return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < min || n > max) return null;
  return Math.round(n * 1000) / 1000;
}

export const parseLat = (v: string | null) => parseCoord(v, -90, 90);
export const parseLon = (v: string | null) => parseCoord(v, -180, 180);
