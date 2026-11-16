"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/client";
import { FAVORITES_EVENT, readFavorites, writeFavorites, type FavoriteCountry } from "@/lib/favorites";

export default function FavoriteButton({ country }: { country: FavoriteCountry }) {
  const { t } = useI18n();
  const [isFav, setIsFav] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setIsFav(readFavorites().some((f) => f.cca3 === country.cca3));
    sync();
    setReady(true);
    window.addEventListener(FAVORITES_EVENT, sync);
    return () => window.removeEventListener(FAVORITES_EVENT, sync);
  }, [country.cca3]);

  const toggle = () => {
    const current = readFavorites();
    const next = isFav ? current.filter((f) => f.cca3 !== country.cca3) : [...current, country];
    writeFavorites(next);
    setIsFav(!isFav);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={!ready}
      aria-pressed={isFav}
      className={`rounded-xl px-4 py-2 font-semibold transition disabled:opacity-50 ${
        isFav ? "bg-amber-400 text-slate-900 hover:bg-amber-300" : "border border-white/20 hover:bg-white/10"
      }`}
    >
      {isFav ? t.favorites.added : t.favorites.add}
    </button>
  );
}
