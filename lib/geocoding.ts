import "server-only";

const GEOCODING_API_URL = process.env.GEOCODING_API_URL ?? "https://geocoding-api.open-meteo.com/v1/search";

type GeocodingResponse = {
  results?: { latitude: number; longitude: number; country_code?: string; name: string }[];
};

/**
 * Obtiene las coordenadas de la capital con la API de geocodificación de Open-Meteo.
 * Devuelve null si no hay resultado confiable (se usa el centro del país como respaldo).
 */
export async function getCapitalCoords(capital: string, cca2: string): Promise<[number, number] | null> {
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
    return [match.latitude, match.longitude];
  } catch {
    return null;
  }
}
