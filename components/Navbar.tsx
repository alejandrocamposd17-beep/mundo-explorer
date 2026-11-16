"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useI18n } from "@/lib/i18n/client";
import LanguageToggle from "./LanguageToggle";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import { OPEN_PALETTE_EVENT } from "./CommandPalette";

export default function Navbar({ appName }: { appName: string }) {
  const pathname = usePathname();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/", label: t.nav.home },
    { href: "/paises", label: t.nav.countries },
    { href: "/mapa", label: t.nav.map },
    { href: "/comparar", label: t.nav.compare },
    { href: "/juegos", label: t.nav.games },
    { href: "/rankings", label: t.nav.rankings },
    { href: "/favoritos", label: t.nav.favorites },
  ];
  const mobileExtra = [
    { href: "/cuenta", label: t.nav.account },
    { href: "/acerca", label: t.nav.about },
  ];

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const openPalette = () => {
    setOpen(false);
    window.dispatchEvent(new Event(OPEN_PALETTE_EVENT));
  };

  const iconButton = "rounded-lg border border-white/15 px-2.5 py-1.5 text-sm hover:bg-white/10";

  return (
    <header className="nav-bg sticky top-0 z-40 border-b border-white/10 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-lg font-bold" onClick={() => setOpen(false)}>
          <Logo className="h-8 w-8 transition-transform duration-500 hover:rotate-12" />
          <span className="font-display tracking-tight">{appName}</span>
        </Link>

        <ul className="hidden items-center gap-0.5 lg:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`rounded-lg px-2.5 py-2 text-sm transition hover:bg-white/10 ${
                  isActive(l.href) ? "bg-brand-600 text-[#fff]" : "text-slate-300"
                }`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1.5">
          <button type="button" onClick={openPalette} className={iconButton} aria-label={t.palette.open} title={t.palette.open}>
            🔍<span className="ml-1.5 hidden text-xs text-slate-400 xl:inline">Ctrl K</span>
          </button>
          <Link href="/cuenta" className={`${iconButton} hidden lg:block`} aria-label={t.nav.account} title={t.nav.account}>
            👤
          </Link>
          <LanguageToggle className={iconButton} />
          <ThemeToggle />
          <button
            type="button"
            className={`${iconButton} lg:hidden`}
            aria-expanded={open}
            aria-controls="menu-movil"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? t.nav.close : t.nav.menu}
          </button>
        </div>
      </nav>

      {open && (
        <ul id="menu-movil" className="border-t border-white/10 px-4 pb-3 lg:hidden">
          {[...links, ...mobileExtra].map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                onClick={() => setOpen(false)}
                className={`mt-2 block rounded-lg px-3 py-2 ${
                  isActive(l.href) ? "bg-brand-600 text-[#fff]" : "text-slate-300 hover:bg-white/10"
                }`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
