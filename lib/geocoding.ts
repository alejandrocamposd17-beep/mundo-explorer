import "server-only";

const GEOCODING_API_URL = process.env.GEOCODING_API_URL ?? "https://geocoding-api.open-meteo.com/v1/search";

type GeocodingResponse = {
  results?: { latitude: number; longitude: number; country_code?: string; name: string; timezone?: string }[];
};

export type CapitalLocation = { coords: [number, number]; timezone?: string };

/** Valida que una zona horaria IANA exista antes de usarla. */
export function isValidTimeZone(tz: unknown): tz is string {
  if (typeof tz !== "string" || tz.length > 64 || !/^[A-Za-z_]+(\/[A-Za-z0-9_+-]+){0,2}$/.test(tz)) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/**
 * Obtiene coordenadas y zona horaria de la capital con la API de geocodificación de Open-Meteo.
 * Devuelve null si no hay resultado confiable (se usa el centro del país como respaldo).
 */
export async function getCapitalLocation(capital: string, cca2: string): Promise<CapitalLocation | null> {
  if (!capital || capital.length > 80 || !/^[a-z]{2}$/i.test(cca2)) return null;

  const url = new URL(GEOCODING_API_URL);
  url.searchParams.set("name", capital);
  url.searchParams.set("count", "5");
  url.searchParams.set("language", "es");
  url.searchParams.set("format", "json");

  try {
    const res = await fetch(url, { next: { revalidate: 604800 }, signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const data = (await res.json()) as GeocodingResponse;
    const match = data.results?.find((r) => r.country_code?.toLowerCase() === cca2.toLowerCase());
    if (!match || !Number.isFinite(match.latitude) || !Number.isFinite(match.longitude)) return null;
    return {
      coords: [match.latitude, match.longitude],
      timezone: isValidTimeZone(match.timezone) ? match.timezone : undefined,
    };
  } catch {
    return null;
  }
}

/** Compatibilidad con la versión anterior. */
export async function getCapitalCoords(capital: string, cca2: string): Promise<[number, number] | null> {
  return (await getCapitalLocation(capital, cca2))?.coords ?? null;
}
