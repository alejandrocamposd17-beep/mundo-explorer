import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import "./globals.css";

const THEME_SCRIPT = `try{var t=localStorage.getItem("mundo-explorer:tema");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="dark"}`;

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "Mundo Explorer";

export const metadata: Metadata = {
  title: { default: APP_NAME, template: `%s · ${APP_NAME}` },
  description: "Explora los países del mundo, sus datos clave y el clima en tiempo real de sus capitales.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Aplica el tema guardado antes de pintar para evitar parpadeo (contenido estático, sin datos del usuario) */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="flex min-h-screen flex-col antialiased">
        <Navbar appName={APP_NAME} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
        <footer className="border-t border-white/10 py-6 text-center text-sm text-slate-400">
          © {new Date().getFullYear()} {APP_NAME} · Desarrollado por Alejandro Campos · Datos: mledoze/countries y Open-Meteo
        </footer>
      </body>
    </html>
  );
}
