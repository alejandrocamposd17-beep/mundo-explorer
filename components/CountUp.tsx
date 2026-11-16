"use client";

import { useEffect, useRef, useState } from "react";
import { intlLocale } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/client";

/** Número que cuenta desde 0 hasta `value` al aparecer en pantalla (respeta "reducir movimiento"). */
export default function CountUp({ value, duration = 1200 }: { value: number; duration?: number }) {
  const { locale } = useI18n();
  const fmt = new Intl.NumberFormat(intlLocale(locale));
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const el = ref.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!el || reduce || typeof IntersectionObserver === "undefined") return;

    let frame = 0;
    const animate = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        setDisplay(Math.round(value * eased));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        animate();
      }
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, duration]);

  return <span ref={ref}>{fmt.format(display)}</span>;
}
