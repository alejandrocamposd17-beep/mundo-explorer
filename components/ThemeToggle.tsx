"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";
const STORAGE_KEY = "mundo-explorer:tema";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  // El tema real ya lo aplicó el script inline del layout; aquí solo lo leemos para pintar el botón
  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark");
  }, []);

  const toggle = () => {
    const next: Theme = theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // sin almacenamiento disponible: el cambio aplica solo a esta visita
    }
    setTheme(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={theme === null}
      className="rounded-lg border border-white/15 px-2.5 py-1.5 text-sm hover:bg-white/10 disabled:opacity-0"
      aria-label={theme === "light" ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
      title={theme === "light" ? "Modo oscuro" : "Modo claro"}
    >
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
}
