import { NextResponse, type NextRequest } from "next/server";
import { getAllCountries } from "@/lib/countries";

// Debe ejecutarse en cada petición para que el país cambie
export const dynamic = "force-dynamic";

/** GET /aleatorio → redirige a un país al azar ("Sorpréndeme"). */
export async function GET(request: NextRequest) {
  try {
    const countries = await getAllCountries();
    const pick = countries[Math.floor(Math.random() * countries.length)];
    const target = pick ? `/paises/${pick.cca3.toLowerCase()}` : "/paises";
    return NextResponse.redirect(new URL(target, request.url), {
      status: 307,
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.redirect(new URL("/paises", request.url), 307);
  }
}
