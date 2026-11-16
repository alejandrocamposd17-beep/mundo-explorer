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
};

export type WeatherResponse = {
  current: CurrentWeather;
  daily: DailyForecast[];
};

const CODES: Record<number, { label: string; icon: string }> = {
  0: { label: "Despejado", icon: "☀️" },
  1: { label: "Mayormente despejado", icon: "🌤️" },
  2: { label: "Parcialmente nublado", icon: "⛅" },
  3: { label: "Nublado", icon: "☁️" },
  45: { label: "Niebla", icon: "🌫️" },
  48: { label: "Niebla con escarcha", icon: "🌫️" },
  51: { label: "Llovizna ligera", icon: "🌦️" },
  53: { label: "Llovizna", icon: "🌦️" },
  55: { label: "Llovizna intensa", icon: "🌧️" },
  61: { label: "Lluvia ligera", icon: "🌧️" },
  63: { label: "Lluvia", icon: "🌧️" },
  65: { label: "Lluvia intensa", icon: "🌧️" },
  71: { label: "Nieve ligera", icon: "🌨️" },
  73: { label: "Nieve", icon: "🌨️" },
  75: { label: "Nieve intensa", icon: "❄️" },
  80: { label: "Chubascos", icon: "🌦️" },
  81: { label: "Chubascos fuertes", icon: "🌧️" },
  82: { label: "Chubascos violentos", icon: "⛈️" },
  95: { label: "Tormenta", icon: "⛈️" },
  96: { label: "Tormenta con granizo", icon: "⛈️" },
  99: { label: "Tormenta fuerte con granizo", icon: "⛈️" },
};

export function describeWeather(code: number) {
  return CODES[code] ?? { label: "Desconocido", icon: "🌡️" };
}
