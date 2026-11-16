"use client";

import { useEffect, useState } from "react";
import { intlLocale } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/client";

/** Hora local en vivo de una zona horaria IANA (se actualiza cada segundo). */
export default function LocalClock({ timeZone, place }: { timeZone: string; place: string }) {
  const { locale, t } = useI18n();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  let time = "--:--:--";
  let date = "";
  if (now) {
    try {
      time = new Intl.DateTimeFormat(intlLocale(locale), { timeZone, timeStyle: "medium" }).format(now);
      date = new Intl.DateTimeFormat(intlLocale(locale), { timeZone, weekday: "long", day: "numeric", month: "long" }).format(now);
    } catch {
      return null;
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
      <p className="text-xs uppercase tracking-wide text-slate-400">
        {t.detail.localTime} · {place}
      </p>
      <p className="mt-1 font-display text-2xl font-bold tabular-nums" aria-live="off">
        🕒 {time}
      </p>
      <p className="text-sm capitalize text-slate-400">{date}</p>
    </div>
  );
}
