"use client";

import { useEffect, useState } from "react";
import ForecastChart from "./ForecastChart";
import { describeWeather, type WeatherResponse } from "@/lib/weather";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: WeatherResponse };

const dayFmt = new Intl.DateTimeFormat("es-SV", { weekday: "short", day: "numeric", timeZone: "UTC" });

export default function WeatherWidget({ lat, lon, place }: { lat: number; lon: number; place: string }) {
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
        if (!res.ok) throw new Error(body?.error ?? "Error al obtener el clima");
        setState({ status: "success", data: body as WeatherResponse });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setState({ status: "error", message: err instanceof Error ? err.message : "Error desconocido" });
      });

    return () => controller.abort();
  }, [lat, lon, attempt]);

  return (
    <section className="force-dark rounded-2xl border border-white/10 bg-gradient-to-br from-sky-900 to-indigo-900 p-6 text-slate-100">
      <h2 className="text-sm uppercase tracking-wider text-sky-200">Clima actual · {place}</h2>

      {state.status === "loading" && (
        <div className="mt-4 animate-pulse space-y-3" aria-busy="true">
          <div className="h-10 w-32 rounded bg-white/10" />
          <div className="h-4 w-48 rounded bg-white/10" />
          <div className="mt-6 grid grid-cols-4 gap-2 sm:grid-cols-7">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-24 rounded-lg bg-white/5" />
            ))}
          </div>
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
            Reintentar
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
                <p className="text-4xl font-bold">{Math.round(state.data.current.temperature)}°C</p>
                <p className="text-sky-100">{describeWeather(state.data.current.weatherCode).label}</p>
              </div>
            </div>
            <dl className="grid flex-1 grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-white/5 p-3">
                <dt className="text-slate-400">Humedad</dt>
                <dd className="text-lg font-semibold">{state.data.current.humidity}%</dd>
              </div>
              <div className="rounded-lg bg-white/5 p-3">
                <dt className="text-slate-400">Viento</dt>
                <dd className="text-lg font-semibold">{state.data.current.windSpeed} km/h</dd>
              </div>
            </dl>
          </div>

          {state.data.daily.length > 0 && (
            <>
              <h3 className="mt-6 text-sm uppercase tracking-wider text-sky-200">Pronóstico de 7 días</h3>
              <ForecastChart days={state.data.daily} />
              <ul className="mt-3 grid grid-cols-2 gap-2 min-[420px]:grid-cols-4 sm:grid-cols-7">
                {state.data.daily.map((d) => {
                  const w = describeWeather(d.weatherCode);
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
            Hora local de la medición: {state.data.current.time.replace("T", " ")} · Fuente: Open-Meteo
          </p>
        </div>
      )}
    </section>
  );
}
