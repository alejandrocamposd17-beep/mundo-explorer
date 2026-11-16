"use client";

import { useEffect } from "react";
import { mergeFavorites, pullFavorites, pushFavorites } from "@/lib/cloudFavorites";
import { FAVORITES_EVENT, readFavorites, writeFavorites } from "@/lib/favorites";
import { getSupabase } from "@/lib/supabase";

/**
 * Sincroniza los favoritos locales con Supabase cuando hay sesión:
 * al iniciar sesión une ambas listas y luego sube cada cambio.
 */
export default function CloudSync() {
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    let userId: string | null = null;
    let applyingRemote = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const initialSync = async (id: string) => {
      const merged = mergeFavorites(readFavorites(), await pullFavorites());
      applyingRemote = true;
      writeFavorites(merged);
      applyingRemote = false;
      await pushFavorites(id, merged);
    };

    const onChange = () => {
      if (!userId || applyingRemote) return;
      clearTimeout(timer);
      const id = userId;
      timer = setTimeout(() => void pushFavorites(id, readFavorites()), 500);
    };

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const newId = session?.user?.id ?? null;
      if (newId && newId !== userId) {
        userId = newId;
        void initialSync(newId);
      } else if (!newId) {
        userId = null;
      }
    });

    window.addEventListener(FAVORITES_EVENT, onChange);
    return () => {
      data.subscription.unsubscribe();
      window.removeEventListener(FAVORITES_EVENT, onChange);
      clearTimeout(timer);
    };
  }, []);

  return null;
}
