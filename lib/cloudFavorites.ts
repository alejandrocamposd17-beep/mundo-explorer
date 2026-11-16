"use client";

import { sanitizeFavorites, type FavoriteCountry } from "./favorites";
import { getSupabase } from "./supabase";

type Row = { cca3: string; name: string; flag: string; region: string };

/** Descarga los favoritos del usuario (RLS garantiza que solo vea los suyos). */
export async function pullFavorites(): Promise<FavoriteCountry[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase.from("favorites").select("cca3, name, flag, region").limit(100);
  if (error || !data) return [];
  return sanitizeFavorites(data as Row[]);
}

/** Reemplaza los favoritos remotos por la lista local (upsert + borrado de los que ya no están). */
export async function pushFavorites(userId: string, list: FavoriteCountry[]): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  const clean = sanitizeFavorites(list);
  const rows = clean.map((f) => ({ user_id: userId, cca3: f.cca3, name: f.name, flag: f.flag, region: f.region }));
  if (rows.length > 0) {
    await supabase.from("favorites").upsert(rows, { onConflict: "user_id,cca3" });
  }
  const keep = clean.map((f) => f.cca3);
  let del = supabase.from("favorites").delete().eq("user_id", userId);
  if (keep.length > 0) del = del.not("cca3", "in", `(${keep.join(",")})`);
  await del;
}

/** Une dos listas sin duplicados (la local primero). */
export function mergeFavorites(local: FavoriteCountry[], remote: FavoriteCountry[]): FavoriteCountry[] {
  const seen = new Set<string>();
  return [...local, ...remote].filter((f) => (seen.has(f.cca3) ? false : (seen.add(f.cca3), true)));
}
