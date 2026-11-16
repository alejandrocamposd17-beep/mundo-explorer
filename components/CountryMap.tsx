"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import "leaflet/dist/leaflet.css";

export type MapPoint = {
  lat: number;
  lng: number;
  label: string;
  href?: string;
};

type Props = {
  points: MapPoint[];
  center: [number, number];
  zoom: number;
  height?: string;
};

/**
 * Mapa interactivo con Leaflet + OpenStreetMap.
 * Leaflet usa `window`, por eso se importa dinámicamente dentro de useEffect (solo en el cliente).
 */
export default function CountryMap({ points, center, zoom, height = "h-80" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let map: import("leaflet").Map | null = null;
    let themeObserver: MutationObserver | null = null;
    let cancelled = false;

    import("leaflet")
      .then((mod) => {
        // Interoperabilidad ESM/CommonJS: según el bundler, Leaflet llega como namespace o como `default`
        const L = ("default" in mod ? (mod as unknown as { default: typeof mod }).default : mod) ?? mod;
        if (cancelled || !containerRef.current) return;
        map = L.map(containerRef.current, { scrollWheelZoom: false }).setView(center, zoom);
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        // Modo oscuro del mapa: se invierten los colores de los mosaicos con un filtro CSS
        // (sin servicios de pago ni claves). Se actualiza cuando el usuario cambia el tema.
        const container = containerRef.current;
        const applyTheme = () =>
          container.classList.toggle("map-dark", document.documentElement.dataset.theme !== "light");
        applyTheme();
        themeObserver = new MutationObserver(applyTheme);
        themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

        for (const p of points) {
          const marker = L.circleMarker([p.lat, p.lng], {
            radius: points.length > 1 ? 5 : 9,
            color: "#ffffff",
            fillColor: "#1f8bff",
            fillOpacity: 0.85,
            weight: 2,
          }).addTo(map);
          // bindTooltip con texto plano: Leaflet lo inserta como texto, no como HTML ejecutable
          const tooltip = document.createElement("span");
          tooltip.textContent = p.label;
          marker.bindTooltip(tooltip);
          if (p.href) {
            const href = p.href;
            marker.on("click", () => router.push(href));
          }
        }
      })
      .catch(() => setFailed(true));

    return () => {
      cancelled = true;
      themeObserver?.disconnect();
      map?.remove();
    };
  }, [points, center, zoom, router]);

  if (failed) {
    return <p className="rounded-xl border border-white/10 p-4 text-sm text-slate-400">No se pudo cargar el mapa.</p>;
  }

  return (
    <div
      ref={containerRef}
      className={`${height} z-0 w-full overflow-hidden rounded-2xl border border-white/10 shadow-xl shadow-black/20`}
      role="region"
      aria-label="Mapa interactivo"
    />
  );
}
