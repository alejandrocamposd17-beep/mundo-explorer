"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/paises", label: "Países" },
  { href: "/favoritos", label: "Favoritos" },
  { href: "/acerca", label: "Acerca de" },
];

export default function Navbar({ appName }: { appName: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b1220]/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold" onClick={() => setOpen(false)}>
          <span aria-hidden>🌎</span>
          <span>{appName}</span>
        </Link>

        <button
          type="button"
          className="rounded-lg border border-white/15 px-3 py-1.5 text-sm md:hidden"
          aria-expanded={open}
          aria-controls="menu-principal"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Cerrar" : "Menú"}
        </button>

        <ul id="menu-principal" className="hidden gap-1 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`rounded-lg px-3 py-2 text-sm transition hover:bg-white/10 ${
                  isActive(l.href) ? "bg-brand-600 text-white" : "text-slate-300"
                }`}
              >
                {l.label}
              </Link>
            </li>
          ))}
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
                  isActive(l.href) ? "bg-brand-600 text-white" : "text-slate-300 hover:bg-white/10"
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
