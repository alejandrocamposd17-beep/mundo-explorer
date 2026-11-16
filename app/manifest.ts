import type { MetadataRoute } from "next";
import { getI18n } from "@/lib/i18n/server";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const { locale, t } = await getI18n();
  return {
    name: "Mundo Explorer",
    short_name: "Mundo",
    description: t.meta.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#0b1220",
    theme_color: "#0b1220",
    lang: locale,
    categories: ["education", "travel", "games"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: t.nav.countries, url: "/paises" },
      { name: t.nav.games, url: "/juegos" },
      { name: t.nav.favorites, url: "/favoritos" },
    ],
  };
}
