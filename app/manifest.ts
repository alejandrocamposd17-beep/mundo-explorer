import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mundo Explorer",
    short_name: "Mundo",
    description: "Explora los países del mundo, su clima y juega con banderas y capitales.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#0b1220",
    theme_color: "#0b1220",
    lang: "es",
    categories: ["education", "travel", "games"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Países", url: "/paises" },
      { name: "Juegos", url: "/juegos" },
      { name: "Favoritos", url: "/favoritos" },
    ],
  };
}
