import { NextResponse, type NextRequest } from "next/server";
import { getAllCountries } from "@/lib/countries";
import { isLocale } from "@/lib/i18n/config";

/**
 * GET /api/paises?lang=es → lista mínima de países para el buscador rápido (Ctrl+K)
 * y para la caché sin conexión. Se cachea 1 día en el CDN.
 */
export async function GET(request: NextRequest) {
  const lang = request.nextUrl.searchParams.get("lang");
  const locale = isLocale(lang) ? lang : "es";
  try {
    const countries = await getAllCountries(locale);
    const data = countries.map((c) => ({ cca3: c.cca3, name: c.name, capital: c.capital ?? "", flag: c.flagPng }));
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600" },
    });
  } catch {
    return NextResponse.json({ error: "No se pudo obtener la lista de países." }, { status: 502 });
  }
}
