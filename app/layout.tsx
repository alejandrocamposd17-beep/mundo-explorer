import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/next";
import CloudSync from "@/components/CloudSync";
import CommandPalette from "@/components/CommandPalette";
import Navbar from "@/components/Navbar";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import { I18nProvider } from "@/lib/i18n/client";
import { getI18n } from "@/lib/i18n/server";
import "./globals.css";

const THEME_SCRIPT = `try{var t=localStorage.getItem("mundo-explorer:tema");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="dark"}`;

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "Mundo Explorer";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mundo-explorer.vercel.app";

// next/font descarga las fuentes en el build y las sirve desde el mismo dominio (sin peticiones a Google)
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return {
    title: { default: APP_NAME, template: `%s · ${APP_NAME}` },
    description: t.meta.description,
    metadataBase: new URL(SITE_URL),
    applicationName: APP_NAME,
    appleWebApp: { capable: true, title: APP_NAME, statusBarStyle: "black-translucent" },
    openGraph: { type: "website", locale: locale === "en" ? "en_US" : "es_SV", siteName: APP_NAME },
    twitter: { card: "summary_large_image" },
  };
}

export const viewport: Viewport = {
  themeColor: "#0b1220",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { locale, t } = await getI18n();
  return (
    <html lang={locale} className={`${inter.variable} ${grotesk.variable}`} suppressHydrationWarning>
      <head>
        {/* Aplica el tema guardado antes de pintar para evitar parpadeo (contenido estático, sin datos del usuario) */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="flex min-h-screen flex-col antialiased">
        <I18nProvider locale={locale} t={t}>
          <Navbar appName={APP_NAME} />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
          <footer className="border-t border-white/10 py-6 text-center text-sm text-slate-400">
            © {new Date().getFullYear()} {APP_NAME} · {t.footer.by} · {t.footer.data} ·{" "}
            <Link href="/acerca" className="hover:underline">
              {t.nav.about}
            </Link>
          </footer>
          <CommandPalette />
          <CloudSync />
          <ServiceWorkerRegister />
        </I18nProvider>
        <Analytics />
      </body>
    </html>
  );
}
