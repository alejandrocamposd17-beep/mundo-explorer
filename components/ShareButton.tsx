"use client";

import { useState } from "react";
import { fmt } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/client";

/** Compartir con la hoja nativa del sistema; si no existe, copiar enlace o abrir WhatsApp. */
export default function ShareButton({ name, path }: { name: string; path: string }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const url = () => new URL(path, window.location.origin).toString();
  const text = fmt(t.share.text, { name });

  const share = async () => {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: name, text, url: url() });
        return;
      } catch {
        // el usuario canceló o no está disponible: mostramos las opciones alternativas
      }
    }
    setOpen((v) => !v);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={share}
        className="rounded-xl border border-white/20 px-4 py-2 font-semibold hover:bg-white/10"
        aria-expanded={open}
      >
        ↗ {t.share.button}
      </button>
      {open && (
        <div className="force-dark absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-xl border border-white/15 bg-[#0f1a2e] text-sm shadow-xl">
          <button type="button" onClick={copy} className="block w-full px-4 py-2.5 text-left hover:bg-white/10">
            {copied ? t.share.copied : `🔗 ${t.share.copy}`}
          </button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${text} ${typeof window === "undefined" ? "" : url()}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-4 py-2.5 hover:bg-white/10"
          >
            💬 {t.share.whatsapp}
          </a>
        </div>
      )}
    </div>
  );
}
