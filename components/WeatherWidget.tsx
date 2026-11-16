"use client";

import { useEffect, useState } from "react";
import { describeWeather, type CurrentWeather } from "@/lib/weather";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: CurrentWeather };

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
        setState({ status: "success", data: body as CurrentWeather });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setState({ status: "error", message: err instanceof Error ? err.message : "Error desconocido" });
      });

    return () => controller.abort();
  }, [lat, lon, attempt]);

  return (
    <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-sky-900/60 to-indigo-900/60 p-6">
      <h2 className="text-sm uppercase tracking-wider text-sky-200">Clima actual · {place}</h2>

      {state.status === "loading" && (
        <div className="mt-4 animate-pulse space-y-3" aria-busy="true">
          <div className="h-10 w-32 rounded bg-white/10" />
          <div className="h-4 w-48 rounded bg-white/10" />
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
          <div className="flex items-center gap-4">
            <span className="text-5xl" aria-hidden>
              {describeWeather(state.data.weatherCode).icon}
            </span>
            <div>
              <p className="text-4xl font-bold">{Math.round(state.data.temperature)}°C</p>
              <p className="text-sky-100">{describeWeather(state.data.weatherCode).label}</p>
            </div>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-white/5 p-3">
              <dt className="text-slate-400">Humedad</dt>
              <dd className="text-lg font-semibold">{state.data.humidity}%</dd>
            </div>
            <div className="rounded-lg bg-white/5 p-3">
              <dt className="text-slate-400">Viento</dt>
              <dd className="text-lg font-semibold">{state.data.windSpeed} km/h</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-slate-400">Hora local de la medición: {state.data.time.replace("T", " ")}</p>
        </div>
      )}
    </section>
  );
}
