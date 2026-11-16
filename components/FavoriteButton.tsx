"use client";

import { useEffect, useState } from "react";
import { readFavorites, writeFavorites, type FavoriteCountry } from "@/lib/favorites";

export default function FavoriteButton({ country }: { country: FavoriteCountry }) {
  const [isFav, setIsFav] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setIsFav(readFavorites().some((f) => f.cca3 === country.cca3));
    setReady(true);
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
      {isFav ? "★ En favoritos" : "☆ Agregar a favoritos"}
    </button>
  );
}
