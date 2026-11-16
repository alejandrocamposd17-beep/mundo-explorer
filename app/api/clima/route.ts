import { NextResponse, type NextRequest } from "next/server";
import { parseLat, parseLon } from "@/lib/validation";
import type { AirQuality, DailyForecast, WeatherResponse } from "@/lib/weather";

const WEATHER_API_URL = process.env.WEATHER_API_URL ?? "https://api.open-meteo.com/v1/forecast";
const AIR_API_URL = process.env.AIR_QUALITY_API_URL ?? "https://air-quality-api.open-meteo.com/v1/air-quality";

type AirResponse = { current?: { us_aqi?: number; pm2_5?: number; pm10?: number } };

/** Calidad del aire actual; si el servicio falla devolvemos null sin romper el clima. */
async function fetchAir(lat: number, lon: number): Promise<AirQuality | null> {
  const url = new URL(AIR_API_URL);
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set("current", "us_aqi,pm2_5,pm10");
  try {
    const res = await fetch(url, { next: { revalidate: 1800 }, signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    const json = (await res.json()) as AirResponse;
    const aqi = json.current?.us_aqi;
    if (typeof aqi !== "number" || !Number.isFinite(aqi)) return null;
    const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
    return { usAqi: Math.round(aqi), pm25: num(json.current?.pm2_5), pm10: num(json.current?.pm10) };
  } catch {
    return null;
  }
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
  daily?: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max?: (number | null)[];
    wind_speed_10m_max?: (number | null)[];
  };
};

/**
 * GET /api/clima?lat=13.7&lon=-89.2
 * Route Handler que actúa como proxy hacia Open-Meteo: valida la entrada,
 * normaliza la respuesta (clima actual, pronóstico de 7 días y calidad del aire) y la cachea 10 minutos.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const lat = parseLat(searchParams.get("lat"));
  const lon = parseLon(searchParams.get("lon"));

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
  url.searchParams.set(
    "daily",
    "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max",
  );
  url.searchParams.set("forecast_days", "7");
  url.searchParams.set("timezone", "auto");

  try {
    const [res, air] = await Promise.all([
      fetch(url, { next: { revalidate: 600 }, signal: AbortSignal.timeout(8000) }),
      fetchAir(lat, lon),
    ]);
    if (!res.ok) {
      return NextResponse.json({ error: "El servicio de clima no está disponible." }, { status: 502 });
    }
    const json = (await res.json()) as OpenMeteoResponse;
    if (!json.current) {
      return NextResponse.json({ error: "Respuesta de clima incompleta." }, { status: 502 });
    }

    const daily: DailyForecast[] = (json.daily?.time ?? []).slice(0, 7).map((date, i) => ({
      date,
      weatherCode: json.daily!.weather_code[i],
      max: json.daily!.temperature_2m_max[i],
      min: json.daily!.temperature_2m_min[i],
      precipitationProbability: json.daily!.precipitation_probability_max?.[i] ?? null,
      windMax: json.daily!.wind_speed_10m_max?.[i] ?? null,
    }));

    const data: WeatherResponse = {
      current: {
        temperature: json.current.temperature_2m,
        humidity: json.current.relative_humidity_2m,
        windSpeed: json.current.wind_speed_10m,
        weatherCode: json.current.weather_code,
        isDay: json.current.is_day === 1,
        time: json.current.time,
      },
      daily,
      air,
    };

    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=300" },
    });
  } catch {
    // No exponemos detalles internos del error al cliente
    return NextResponse.json({ error: "No se pudo consultar el clima." }, { status: 504 });
  }
}
