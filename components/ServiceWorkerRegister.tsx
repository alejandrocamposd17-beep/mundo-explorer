"use client";

import { useEffect } from "react";

/** Registra el service worker (PWA) solo en producción. */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      // si falla, la app sigue funcionando normalmente en línea
    });
  }, []);
  return null;
}
