import type { DailyForecast } from "@/lib/weather";

/** Gráfica SVG de temperaturas máximas y mínimas (sin librerías). */
type Labels = { max: string; min: string; title: string };

export default function ForecastChart({
  days,
  labels,
  locale = "es-SV",
}: {
  days: DailyForecast[];
  labels: Labels;
  locale?: string;
}) {
  if (days.length < 2) return null;
  const dayFmt = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" });

  const W = 700;
  const H = 220;
  const pad = { top: 28, right: 24, bottom: 34, left: 24 };
  const values = days.flatMap((d) => [d.max, d.min]);
  const lo = Math.floor(Math.min(...values)) - 2;
  const hi = Math.ceil(Math.max(...values)) + 2;
  const x = (i: number) => pad.left + (i * (W - pad.left - pad.right)) / (days.length - 1);
  const y = (v: number) => pad.top + ((hi - v) * (H - pad.top - pad.bottom)) / (hi - lo || 1);

  const line = (key: "max" | "min") => days.map((d, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(d[key])}`).join(" ");
  const area = `${line("max")} ${days
    .map((_, i) => days.length - 1 - i)
    .map((i) => `L${x(i)},${y(days[i].min)}`)
    .join(" ")} Z`;

  return (
    <figure className="mt-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-labelledby="forecast-title">
        <title id="forecast-title">
          {`${labels.title}: ${days
            .map((d) => `${dayFmt.format(new Date(`${d.date}T00:00:00Z`))} ${Math.round(d.max)}° / ${Math.round(d.min)}°`)
            .join(", ")}`}
        </title>
        <defs>
          <linearGradient id="forecast-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fbbf24" stopOpacity="0.35" />
            <stop offset="1" stopColor="#4aa8ff" stopOpacity="0.25" />
          </linearGradient>
        </defs>
        {days.map((d, i) => (
          <line key={d.date} x1={x(i)} x2={x(i)} y1={pad.top - 8} y2={H - pad.bottom} stroke="white" strokeOpacity="0.08" />
        ))}
        <path d={area} fill="url(#forecast-fill)" />
        <path d={line("max")} fill="none" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d={line("min")} fill="none" stroke="#4aa8ff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {days.map((d, i) => (
          <g key={d.date}>
            <circle cx={x(i)} cy={y(d.max)} r="4.5" fill="#fbbf24" />
            <circle cx={x(i)} cy={y(d.min)} r="4.5" fill="#4aa8ff" />
            <text x={x(i)} y={y(d.max) - 10} textAnchor="middle" fontSize="13" fontWeight="600" fill="#fef3c7">
              {Math.round(d.max)}°
            </text>
            <text x={x(i)} y={y(d.min) + 20} textAnchor="middle" fontSize="13" fill="#bfdbfe">
              {Math.round(d.min)}°
            </text>
            <text x={x(i)} y={H - 8} textAnchor="middle" fontSize="13" fill="#cbd5e1" style={{ textTransform: "capitalize" }}>
              {dayFmt.format(new Date(`${d.date}T00:00:00Z`))}
            </text>
          </g>
        ))}
      </svg>
      <figcaption className="mt-1 flex justify-center gap-4 text-xs text-slate-300">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-4 rounded bg-amber-400" aria-hidden /> {labels.max}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-4 rounded bg-brand-400" aria-hidden /> {labels.min}
        </span>
      </figcaption>
    </figure>
  );
}
