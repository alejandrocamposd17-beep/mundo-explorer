"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fmt } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/client";
import { FAVORITES_EVENT, readFavorites, writeFavorites, type FavoriteCountry } from "@/lib/favorites";
import { getSupabase } from "@/lib/supabase";

export default function FavoritesPage() {
  const { t } = useI18n();
  const [favorites, setFavorites] = useState<FavoriteCountry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [cloud, setCloud] = useState(false);

  useEffect(() => {
    const sync = () => setFavorites(readFavorites());
    sync();
    setLoaded(true);
    // Mantener la lista sincronizada entre pestañas y componentes
    window.addEventListener("storage", sync);
    window.addEventListener(FAVORITES_EVENT, sync);

    const supabase = getSupabase();
    const sub = supabase?.auth.onAuthStateChange((_e, session) => setCloud(Boolean(session)));
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(FAVORITES_EVENT, sync);
      sub?.data.subscription.unsubscribe();
    };
  }, []);

  const remove = (cca3: string) => writeFavorites(favorites.filter((f) => f.cca3 !== cca3));
  const clearAll = () => writeFavorites([]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t.favorites.title}</h1>
          <p className="mt-2 text-slate-400">
            {cloud ? `☁️ ${t.favorites.subtitleCloud}` : t.favorites.subtitleLocal}{" "}
            {!cloud && (
              <Link href="/cuenta" className="text-brand-400 hover:underline">
                {t.nav.account} →
              </Link>
            )}
          </p>
        </div>
        {favorites.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="rounded-lg border border-red-400/40 px-3 py-2 text-sm text-red-300 hover:bg-red-500/10"
          >
            {t.favorites.clear}
          </button>
        )}
      </div>

      {!loaded ? (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-white/15 p-10 text-center">
          <p className="text-slate-400">{t.favorites.empty}</p>
          <Link
            href="/paises"
            className="mt-4 inline-block rounded-xl bg-brand-600 px-4 py-2 font-semibold text-[#fff] hover:bg-brand-500"
          >
            {t.favorites.explore}
          </Link>
        </div>
      ) : (
        <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((f) => (
            <li key={f.cca3} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.flag} alt="" className="h-12 w-18 rounded object-cover" />
              <div className="min-w-0 flex-1">
                <Link href={`/paises/${f.cca3.toLowerCase()}`} className="block truncate font-semibold hover:underline">
                  {f.name}
                </Link>
                <p className="text-sm text-slate-400">{f.region}</p>
              </div>
              <button
                type="button"
                onClick={() => remove(f.cca3)}
                aria-label={fmt(t.favorites.remove, { name: f.name })}
                className="rounded-lg px-2 py-1 text-slate-400 hover:bg-white/10 hover:text-red-300"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
