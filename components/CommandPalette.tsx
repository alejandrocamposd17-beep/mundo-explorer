"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { normalizeText } from "@/lib/filter";
import { useI18n } from "@/lib/i18n/client";

export const OPEN_PALETTE_EVENT = "open-command-palette";

type Item = { cca3: string; name: string; capital: string; flag: string };

/** Buscador rápido global: Ctrl+K / Cmd+K o el botón 🔍 de la barra. */
export default function CommandPalette() {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<Item[] | null>(null);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const loadedLocale = useRef<string | null>(null);

  // Atajos de teclado y evento del botón de la barra
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_PALETTE_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_PALETTE_EVENT, onOpen);
    };
  }, []);

  // Carga perezosa de la lista la primera vez que se abre (o si cambia el idioma)
  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActive(0);
    requestAnimationFrame(() => inputRef.current?.focus());
    if (loadedLocale.current === locale) return;
    const controller = new AbortController();
    fetch(`/api/paises?lang=${locale}`, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : []))
      .then((data: unknown) => {
        if (Array.isArray(data)) {
          setItems(data as Item[]);
          loadedLocale.current = locale;
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, [open, locale]);

  const results = useMemo(() => {
    if (!items) return [];
    const q = normalizeText(query.trim());
    const list = q
      ? items.filter((i) => normalizeText(i.name).includes(q) || normalizeText(i.capital).includes(q))
      : items;
    return list.slice(0, 8);
  }, [items, query]);

  const go = (item: Item | undefined) => {
    if (!item) return;
    setOpen(false);
    router.push(`/paises/${item.cca3.toLowerCase()}`);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-[12vh] backdrop-blur-sm"
      onClick={() => setOpen(false)}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t.palette.open}
        className="force-dark w-full max-w-lg overflow-hidden rounded-2xl border border-white/15 bg-[#0f1a2e] text-slate-100 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          value={query}
          maxLength={60}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(a + 1, results.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, 0));
            } else if (e.key === "Enter") {
              go(results[active]);
            }
          }}
          placeholder={t.palette.placeholder}
          className="w-full border-b border-white/10 bg-transparent px-5 py-4 text-lg outline-none placeholder:text-slate-500"
          aria-label={t.palette.placeholder}
          role="combobox"
          aria-expanded="true"
          aria-controls="palette-results"
          aria-activedescendant={results[active] ? `palette-${results[active].cca3}` : undefined}
        />
        <ul id="palette-results" role="listbox" className="max-h-80 overflow-y-auto p-2">
          {items === null && <li className="px-3 py-4 text-sm text-slate-400">{t.common.loading}</li>}
          {items !== null && results.length === 0 && <li className="px-3 py-4 text-sm text-slate-400">{t.palette.empty}</li>}
          {results.map((r, i) => (
            <li
              key={r.cca3}
              id={`palette-${r.cca3}`}
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              onClick={() => go(r)}
              className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 ${i === active ? "bg-brand-600 text-[#fff]" : ""}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={r.flag} alt="" className="h-5 w-8 rounded-sm object-cover" />
              <span className="flex-1 truncate font-medium">{r.name}</span>
              <span className={`truncate text-sm ${i === active ? "text-brand-100" : "text-slate-400"}`}>{r.capital}</span>
            </li>
          ))}
        </ul>
        <p className="border-t border-white/10 px-5 py-2 text-xs text-slate-400">{t.palette.hint}</p>
      </div>
    </div>
  );
}
