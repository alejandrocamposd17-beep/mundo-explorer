import type { MetadataRoute } from "next";
import { getAllCountries } from "@/lib/countries";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mundo-explorer.vercel.app";

/** sitemap.xml: páginas principales + las 250 fichas de países para que Google las indexe. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const pages = ["", "/paises", "/mapa", "/comparar", "/rankings", "/juegos", "/juegos/banderas", "/juegos/capitales", "/acerca"];
  const staticEntries: MetadataRoute.Sitemap = pages.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.8,
  }));

  let countryEntries: MetadataRoute.Sitemap = [];
  try {
    const countries = await getAllCountries("es");
    countryEntries = countries.map((c) => ({
      url: `${SITE_URL}/paises/${c.cca3.toLowerCase()}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.6,
    }));
  } catch {
    // si la API de países falla, el sitemap sigue publicando las páginas principales
  }
  return [...staticEntries, ...countryEntries];
}
