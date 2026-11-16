export type FavoriteCountry = {
  cca3: string;
  name: string;
  flag: string;
  region: string;
};

const KEY = "mundo-explorer:favoritos";
const MAX_FAVORITES = 100;
export const FAVORITES_EVENT = "favorites-changed";

export function isFavorite(value: unknown): value is FavoriteCountry {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.cca3 === "string" &&
    /^[A-Z]{3}$/.test(v.cca3) &&
    typeof v.name === "string" &&
    v.name.length <= 100 &&
    typeof v.flag === "string" &&
    /^https:\/\//.test(v.flag) &&
    typeof v.region === "string"
  );
}

/** Filtra cualquier valor desconocido y deja solo favoritos válidos. */
export function sanitizeFavorites(value: unknown): FavoriteCountry[] {
  return Array.isArray(value) ? value.filter(isFavorite).slice(0, MAX_FAVORITES) : [];
}

/** Lee favoritos de localStorage validando su forma (los datos del navegador no son confiables). */
export function readFavorites(): FavoriteCountry[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    return sanitizeFavorites(JSON.parse(raw));
  } catch {
    return [];
  }
}

export function writeFavorites(list: FavoriteCountry[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX_FAVORITES)));
    window.dispatchEvent(new Event(FAVORITES_EVENT));
  } catch {
    // Almacenamiento no disponible (modo privado, cuota llena): se ignora sin romper la UI
  }
}
