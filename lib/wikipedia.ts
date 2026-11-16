import "server-only";
import type { Locale } from "./i18n/config";

export type WikiSummary = {
  extract: string;
  image?: { src: string; width: number; height: number };
  url: string;
};

type WikiResponse = {
  type?: string;
  extract?: string;
  thumbnail?: { source: string; width: number; height: number };
  originalimage?: { source: string; width: number; height: number };
  content_urls?: { desktop?: { page?: string } };
};

const WIKI_HOST = /^https:\/\/upload\.wikimedia\.org\//;

/**
 * Resumen y foto principal del artículo de Wikipedia (API REST pública, sin clave).
 * Solo se aceptan imágenes de upload.wikimedia.org y enlaces de wikipedia.org.
 */
export async function getWikiSummary(title: string, locale: Locale): Promise<WikiSummary | null> {
  if (!title || title.length > 120) return null;
  // Si el nombre es ambiguo (ej. "Georgia"), se intenta con el sufijo "(país)" / "(country)"
  const direct = await fetchSummary(title, locale);
  if (direct) return direct;
  return fetchSummary(`${title} (${locale === "en" ? "country" : "país"})`, locale);
}

async function fetchSummary(title: string, locale: Locale): Promise<WikiSummary | null> {
  const lang = locale === "en" ? "en" : "es";
  const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, "_"))}`;
  try {
    const res = await fetch(url, {
      next: { revalidate: 604800 },
      signal: AbortSignal.timeout(5000),
      headers: { "Api-User-Agent": "MundoExplorer/1.0 (https://mundo-explorer.vercel.app)" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as WikiResponse;
    if (data.type === "disambiguation" || !data.extract) return null;

    const img = data.thumbnail && WIKI_HOST.test(data.thumbnail.source) ? data.thumbnail : undefined;
    const page = data.content_urls?.desktop?.page;
    return {
      extract: data.extract.slice(0, 1200),
      image: img ? { src: img.source, width: img.width, height: img.height } : undefined,
      url: page && page.startsWith(`https://${lang}.wikipedia.org/`) ? page : `https://${lang}.wikipedia.org/`,
    };
  } catch {
    return null;
  }
}
