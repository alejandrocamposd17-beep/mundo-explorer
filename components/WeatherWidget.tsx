"use client";

import { useEffect, useState } from "react";
import { fmt, intlLocale } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/client";
import { aqiLevel, computeAlerts, describeWeather, type WeatherAlert, type WeatherResponse } from "@/lib/weather";
import ForecastChart from "./ForecastChart";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: WeatherResponse };

const AQI_COLORS = ["bg-emerald-400", "bg-yellow-300", "bg-orange-400", "bg-red-500", "bg-purple-500", "bg-rose-900"];

export default function WeatherWidget({ lat, lon, place }: { lat: number; lon: number; place: string }) {
  const { locale, t } = useI18n();
  const [state, setState] = useState<State>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading" });

    fetch(`/api/clima?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body?.error ?? "error");
        setState({ status: "success", data: body as WeatherResponse });
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setState({ status: "error", message: t.weather.error });
      });

    return () => controller.abort();
  }, [lat, lon, attempt, t.weather.error]);

  const dayFmt = new Intl.DateTimeFormat(intlLocale(locale), { weekday: "short", day: "numeric", timeZone: "UTC" });
  const dayLong = new Intl.DateTimeFormat(intlLocale(locale), { weekday: "long", timeZone: "UTC" });
  const dayOf = (date: string) => dayLong.format(new Date(`${date}T00:00:00Z`));

  const alertText = (a: WeatherAlert) => {
    const day = dayOf(a.date);
    switch (a.kind) {
      case "heat":
        return { icon: "🥵", text: fmt(t.weather.alertHeat, { t: a.value, day }) };
      case "cold":
        return { icon: "🥶", text: fmt(t.weather.alertCold, { t: a.value, day }) };
      case "rain":
        return { icon: "🌧️", text: fmt(t.weather.alertRain, { p: a.value, day }) };
      case "storm":
        return { icon: "⛈️", text: fmt(t.weather.alertStorm, { day }) };
      case "wind":
        return { icon: "💨", text: fmt(t.weather.alertWind, { v: a.value, day }) };
    }
  };

  return (
    <section className="force-dark rounded-2xl border border-white/10 bg-gradient-to-br from-sky-900 to-indigo-900 p-6 text-slate-100">
      <h2 className="text-sm uppercase tracking-wider text-sky-200">{fmt(t.weather.current, { place })}</h2>

      {state.status === "loading" && (
        <div className="mt-4 animate-pulse space-y-3" aria-busy="true">
          <div className="h-10 w-32 rounded bg-white/10" />
          <div className="h-4 w-48 rounded bg-white/10" />
          <div className="mt-6 h-40 rounded-lg bg-white/5" />
        </div>
      )}

      {state.status === "error" && (
        <div className="mt-4">
          <p className="text-red-300">{state.message}</p>
          <button
            type="button"
            onClick={() => setAttempt((a) => a + 1)}
            className="mt-3 rounded-lg bg-white/10 px-3 py-1.5 text-sm hover:bg-white/20"
          >
            {t.weather.retry}
          </button>
        </div>
      )}

      {state.status === "success" && (
        <div className="mt-4">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-4">
              <span className="text-5xl" aria-hidden>
                {describeWeather(state.data.current.weatherCode).icon}
              </span>
              <div>
                <p className="font-display text-4xl font-bold">{Math.round(state.data.current.temperature)}°C</p>
                <p className="text-sky-100">{describeWeather(state.data.current.weatherCode, t.weather.codes).label}</p>
              </div>
            </div>
            <dl className="grid flex-1 grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-lg bg-white/5 p-3">
                <dt className="text-slate-400">{t.weather.humidity}</dt>
                <dd className="text-lg font-semibold">{state.data.current.humidity}%</dd>
              </div>
              <div className="rounded-lg bg-white/5 p-3">
                <dt className="text-slate-400">{t.weather.wind}</dt>
                <dd className="text-lg font-semibold">{state.data.current.windSpeed} km/h</dd>
              </div>
              {state.data.air && (
                <div className="col-span-2 rounded-lg bg-white/5 p-3 sm:col-span-1">
                  <dt className="text-slate-400">{t.weather.airQuality}</dt>
                  <dd className="flex items-center gap-2 text-lg font-semibold">
                    <span className={`h-3 w-3 rounded-full ${AQI_COLORS[aqiLevel(state.data.air.usAqi)]}`} aria-hidden />
                    {state.data.air.usAqi}
                    <span className="text-xs font-normal text-slate-300">
                      {t.weather.aqiLevels[aqiLevel(state.data.air.usAqi)]}
                    </span>
                  </dd>
                  {state.data.air.pm25 !== null && (
                    <dd className="text-xs text-slate-400">
                      PM2.5 {state.data.air.pm25} · PM10 {state.data.air.pm10 ?? "—"} µg/m³
                    </dd>
                  )}
                </div>
              )}
            </dl>
          </div>

          {state.data.daily.length > 0 && (
            <>
              <h3 className="mt-6 text-sm uppercase tracking-wider text-sky-200">{t.weather.alerts}</h3>
              {(() => {
                const alerts = computeAlerts(state.data.daily);
                return alerts.length === 0 ? (
                  <p className="mt-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">✅ {t.weather.noAlerts}</p>
                ) : (
                  <ul className="mt-2 space-y-1.5">
                    {alerts.map((a, i) => {
                      const { icon, text } = alertText(a);
                      return (
                        <li key={`${a.kind}-${a.date}-${i}`} className="rounded-lg bg-amber-400/15 px-3 py-2 text-sm text-amber-100">
                          <span aria-hidden>{icon}</span> {text}
                        </li>
                      );
                    })}
                  </ul>
                );
              })()}

              <h3 className="mt-6 text-sm uppercase tracking-wider text-sky-200">{t.weather.forecast}</h3>
              <ForecastChart
                days={state.data.daily}
                labels={{ max: t.weather.max, min: t.weather.min, title: fmt(t.weather.chartTitle, { n: state.data.daily.length }) }}
                locale={intlLocale(locale)}
              />
              <ul className="mt-3 grid grid-cols-2 gap-2 min-[420px]:grid-cols-4 sm:grid-cols-7">
                {state.data.daily.map((d) => {
                  const w = describeWeather(d.weatherCode, t.weather.codes);
                  return (
                    <li key={d.date} className="rounded-lg bg-white/5 p-3 text-center" title={w.label}>
                      <p className="text-xs capitalize text-slate-300">{dayFmt.format(new Date(`${d.date}T00:00:00Z`))}</p>
                      <p className="my-1 text-2xl" aria-hidden>
                        {w.icon}
                      </p>
                      <p className="text-sm font-semibold">
                        {Math.round(d.max)}° <span className="font-normal text-slate-400">{Math.round(d.min)}°</span>
                      </p>
                      {d.precipitationProbability !== null && (
                        <p className="mt-1 text-xs text-sky-200">💧 {d.precipitationProbability}%</p>
                      )}
                      <span className="sr-only">{w.label}</span>
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          <p className="mt-3 text-xs text-slate-400">
            {fmt(t.weather.measured, { time: state.data.current.time.replace("T", " ") })}
          </p>
        </div>
      )}
    </section>
  );
}
