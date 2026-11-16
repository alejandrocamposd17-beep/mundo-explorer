"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { fmt } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/client";
import { ALL } from "@/lib/filter";
import { buildQuestion, type QuizItem } from "@/lib/quiz";

type Mode = "flags" | "capitals";
type Question = NonNullable<ReturnType<typeof buildQuestion>>;

const bestKey = (mode: Mode, region: string) => `mundo-explorer:record:${mode}:${region}`;

function readBest(key: string) {
  try {
    const n = Number(localStorage.getItem(key));
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  } catch {
    return 0;
  }
}

/** Juego de opción múltiple: banderas o capitales, con puntaje, racha y récord. */
export default function QuizGame({ mode, items }: { mode: Mode; items: QuizItem[] }) {
  const { locale, t } = useI18n();
  const [region, setRegion] = useState(ALL);
  const [question, setQuestion] = useState<Question | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);

  const regions = useMemo(
    () => Array.from(new Set(items.map((i) => i.region))).sort((a, b) => a.localeCompare(b, locale)),
    [items, locale],
  );
  const pool = useMemo(() => (region === ALL ? items : items.filter((i) => i.region === region)), [items, region]);
  const getAnswer = useCallback(
    (item: QuizItem) => (mode === "flags" ? item.name : item.capital),
    [mode],
  );

  const next = useCallback(() => {
    setPicked(null);
    setQuestion(buildQuestion(pool, getAnswer));
  }, [pool, getAnswer]);

  // Nueva partida al cambiar de nivel (la pregunta se crea en el cliente para evitar diferencias de hidratación)
  useEffect(() => {
    setScore(0);
    setStreak(0);
    setBest(readBest(bestKey(mode, region)));
    next();
  }, [mode, region, next]);

  const answer = (option: string) => {
    if (!question || picked) return;
    setPicked(option);
    if (option === question.answer) {
      const newScore = score + 1;
      setScore(newScore);
      setStreak((s) => s + 1);
      if (newScore > best) {
        setBest(newScore);
        try {
          localStorage.setItem(bestKey(mode, region), String(newScore));
        } catch {
          // sin almacenamiento: el récord dura solo esta sesión
        }
      }
    } else {
      setStreak(0);
    }
  };

  const restart = () => {
    setScore(0);
    setStreak(0);
    next();
  };

  const optionClass = (option: string) => {
    const base = "w-full rounded-xl border px-4 py-3 text-left font-semibold transition";
    if (!picked) return `${base} border-white/15 bg-white/5 hover:-translate-y-0.5 hover:border-brand-400 hover:bg-white/10`;
    if (option === question?.answer) return `${base} border-emerald-400 bg-emerald-500/20`;
    if (option === picked) return `${base} border-red-400 bg-red-500/20`;
    return `${base} border-white/10 bg-white/5 opacity-60`;
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/juegos" className="text-sm text-brand-400 hover:underline">
        {t.games.back}
      </Link>
      <h1 className="text-3xl font-bold">{mode === "flags" ? t.games.flagsTitle : t.games.capitalsTitle}</h1>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-400">{t.games.level}</span>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="rounded-lg border border-white/15 bg-slate-900 px-3 py-2 outline-none focus:border-brand-400"
          >
            <option value={ALL}>{t.games.allRegions}</option>
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <dl className="flex gap-3 text-center">
          {[
            { label: t.games.score, value: score },
            { label: t.games.streak, value: `${streak}${streak >= 3 ? " 🔥" : ""}` },
            { label: t.games.best, value: best },
          ].map((s) => (
            <div key={s.label} className="min-w-20 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <dt className="text-xs text-slate-400">{s.label}</dt>
              <dd className="font-display text-xl font-bold">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6" aria-live="polite">
        {!question ? (
          <div className="h-64 animate-pulse rounded-xl bg-white/5" />
        ) : (
          <>
            <p className="text-lg font-semibold">
              {mode === "flags" ? t.games.flagsQuestion : fmt(t.games.capitalsQuestion, { name: question.item.name })}
            </p>
            {mode === "flags" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={question.item.flag}
                alt="?"
                className="mx-auto my-6 h-40 w-auto max-w-full rounded-lg border border-white/10 object-contain shadow-xl"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={question.item.flag} alt="" className="my-4 h-12 w-auto rounded shadow" />
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              {question.options.map((o) => (
                <button key={o} type="button" onClick={() => answer(o)} disabled={Boolean(picked)} className={optionClass(o)}>
                  {o}
                </button>
              ))}
            </div>
            {picked && (
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <p className={picked === question.answer ? "font-semibold text-emerald-300" : "font-semibold text-red-300"}>
                  {picked === question.answer ? t.games.correct : fmt(t.games.wrong, { answer: question.answer })}
                </p>
                <button
                  type="button"
                  onClick={next}
                  autoFocus
                  className="rounded-xl bg-brand-600 px-5 py-2.5 font-semibold text-[#fff] hover:bg-brand-500"
                >
                  {t.games.next}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <button type="button" onClick={restart} className="text-sm text-slate-400 hover:text-slate-200">
        ↺ {t.games.restart}
      </button>
    </div>
  );
}
