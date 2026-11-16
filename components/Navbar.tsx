"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";

const LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/paises", label: "Países" },
  { href: "/mapa", label: "Mapa" },
  { href: "/comparar", label: "Comparar" },
  { href: "/favoritos", label: "Favoritos" },
  { href: "/acerca", label: "Acerca de" },
];

export default function Navbar({ appName }: { appName: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 nav-bg backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold" onClick={() => setOpen(false)}>
          <Logo className="h-8 w-8 transition-transform duration-500 hover:rotate-12" />
          <span className="font-display tracking-tight">{appName}</span>
        </Link>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
        <button
          type="button"
          className="rounded-lg border border-white/15 px-3 py-1.5 text-sm"
          aria-expanded={open}
          aria-controls="menu-principal"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Cerrar" : "Menú"}
        </button>
        </div>

        <ul id="menu-principal" className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`rounded-lg px-3 py-2 text-sm transition hover:bg-white/10 ${
                  isActive(l.href) ? "bg-brand-600 text-[#fff]" : "text-slate-300"
                }`}
              >
                {l.label}
              </Link>
            </li>
          ))}
          <li className="ml-2">
            <ThemeToggle />
          </li>
        </ul>
      </nav>

      {open && (
        <ul className="border-t border-white/10 px-4 pb-3 md:hidden">
          {LINKS.map((l) => (
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
