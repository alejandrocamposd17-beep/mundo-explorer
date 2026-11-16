export type CurrentWeather = {
  temperature: number;
  windSpeed: number;
  humidity: number;
  weatherCode: number;
  isDay: boolean;
  time: string;
};

export type DailyForecast = {
  date: string;
  weatherCode: number;
  max: number;
  min: number;
  precipitationProbability: number | null;
  windMax: number | null;
};

export type AirQuality = {
  usAqi: number;
  pm25: number | null;
  pm10: number | null;
};

export type WeatherResponse = {
  current: CurrentWeather;
  daily: DailyForecast[];
  air: AirQuality | null;
};

const ICONS: Record<number, string> = {
  0: "☀️",
  1: "🌤️",
  2: "⛅",
  3: "☁️",
  45: "🌫️",
  48: "🌫️",
  51: "🌦️",
  53: "🌦️",
  55: "🌧️",
  61: "🌧️",
  63: "🌧️",
  65: "🌧️",
  71: "🌨️",
  73: "🌨️",
  75: "❄️",
  80: "🌦️",
  81: "🌧️",
  82: "⛈️",
  95: "⛈️",
  96: "⛈️",
  99: "⛈️",
};

/** Ícono y etiqueta (según el diccionario del idioma activo) para un código WMO. */
export function describeWeather(code: number, labels?: Record<string, string>) {
  return {
    icon: ICONS[code] ?? "🌡️",
    label: labels?.[String(code)] ?? labels?.unknown ?? String(code),
  };
}

/** Nivel del índice de calidad del aire (US AQI): 0 = buena … 5 = peligrosa. */
export function aqiLevel(aqi: number): number {
  if (aqi <= 50) return 0;
  if (aqi <= 100) return 1;
  if (aqi <= 150) return 2;
  if (aqi <= 200) return 3;
  if (aqi <= 300) return 4;
  return 5;
}

export type WeatherAlert = {
  kind: "heat" | "cold" | "rain" | "storm" | "wind";
  date: string;
  value: number;
};

/** Alertas simples a partir del pronóstico (umbrales conservadores). */
export function computeAlerts(days: DailyForecast[]): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];
  for (const d of days) {
    if ([95, 96, 99].includes(d.weatherCode)) alerts.push({ kind: "storm", date: d.date, value: d.weatherCode });
    if (d.max >= 35) alerts.push({ kind: "heat", date: d.date, value: Math.round(d.max) });
    if (d.min <= -10) alerts.push({ kind: "cold", date: d.date, value: Math.round(d.min) });
    if (d.precipitationProbability !== null && d.precipitationProbability >= 80)
      alerts.push({ kind: "rain", date: d.date, value: d.precipitationProbability });
    if (d.windMax !== null && d.windMax >= 50) alerts.push({ kind: "wind", date: d.date, value: Math.round(d.windMax) });
  }
  return alerts.slice(0, 6);
}
