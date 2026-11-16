"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useI18n } from "@/lib/i18n/client";
import { LOCALE_COOKIE } from "@/lib/i18n/config";

/** Cambia el idioma guardándolo en una cookie y re-renderizando los Server Components. */
export default function LanguageToggle({ className = "" }: { className?: string }) {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const next = locale === "es" ? "en" : "es";

  const toggle = () => {
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = next;
    startTransition(() => router.refresh());
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      className={`${className} font-semibold disabled:opacity-50`}
      aria-label={t.nav.languageLabel}
      title={t.nav.languageLabel}
      lang={next}
    >
      {next.toUpperCase()}
    </button>
  );
}
