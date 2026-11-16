import { NextResponse, type NextRequest } from "next/server";
import type { CurrentWeather } from "@/lib/weather";

const WEATHER_API_URL = process.env.WEATHER_API_URL ?? "https://api.open-meteo.com/v1/forecast";

function parseCoord(value: string | null, min: number, max: number): number | null {
  if (value === null || value.trim() === "" || value.length > 20) return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < min || n > max) return null;
  return Math.round(n * 1000) / 1000;
}

type OpenMeteoResponse = {
  current?: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    weather_code: number;
    is_day: number;
  };
};

/**
 * GET /api/clima?lat=13.7&lon=-89.2
 * Route Handler que actúa como proxy hacia Open-Meteo: valida la entrada,
 * normaliza la respuesta y la cachea 10 minutos.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const lat = parseCoord(searchParams.get("lat"), -90, 90);
  const lon = parseCoord(searchParams.get("lon"), -180, 180);

  if (lat === null || lon === null) {
    return NextResponse.json(
      { error: "Parámetros inválidos: 'lat' debe estar entre -90 y 90 y 'lon' entre -180 y 180." },
      { status: 400 },
    );
  }

  const url = new URL(WEATHER_API_URL);
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set("current", "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,is_day");
  url.searchParams.set("timezone", "auto");

  try {
    const res = await fetch(url, {
      next: { revalidate: 600 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      return NextResponse.json({ error: "El servicio de clima no está disponible." }, { status: 502 });
    }
    const json = (await res.json()) as OpenMeteoResponse;
    if (!json.current) {
      return NextResponse.json({ error: "Respuesta de clima incompleta." }, { status: 502 });
    }

    const data: CurrentWeather = {
      temperature: json.current.temperature_2m,
      humidity: json.current.relative_humidity_2m,
      windSpeed: json.current.wind_speed_10m,
      weatherCode: json.current.weather_code,
      isDay: json.current.is_day === 1,
      time: json.current.time,
    };

    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=300" },
    });
  } catch {
    // No exponemos detalles internos del error al cliente
    return NextResponse.json({ error: "No se pudo consultar el clima." }, { status: 504 });
  }
}
