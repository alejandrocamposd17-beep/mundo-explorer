import type { Metadata } from "next";

export const metadata: Metadata = { title: "Acerca de" };

const STACK = [
  { name: "Next.js 16 (App Router)", desc: "Rutas, Server Components, Route Handlers y streaming." },
  { name: "TypeScript", desc: "Tipado estricto en todo el proyecto." },
  { name: "Tailwind CSS v4", desc: "Diseño responsive mobile-first." },
  { name: "mledoze/countries", desc: "Dataset JSON público con datos de 250 países." },
  { name: "Open-Meteo", desc: "Clima, pronóstico de 7 días y geocodificación de capitales." },
  { name: "Leaflet + OpenStreetMap", desc: "Mapas interactivos sin claves de API." },
  { name: "Vitest + GitHub Actions", desc: "Pruebas unitarias y CI en cada push." },
  { name: "Vercel", desc: "Despliegue continuo desde GitHub." },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Acerca del proyecto</h1>
        <p className="mt-3 text-slate-300">
          Mundo Explorer es una aplicación web construida con la metodología <strong>Vibe Coding</strong>: el
          desarrollo se apoyó en Claude (Anthropic) como copiloto para generar estructura, componentes y estilos,
          mientras que la arquitectura, la validación del código y las decisiones técnicas fueron dirigidas y
          revisadas manualmente.
        </p>
      </div>

      <section>
        <h2 className="mb-4 text-xl font-bold">Tecnologías</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {STACK.map((s) => (
            <li key={s.name} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="font-semibold text-brand-400">{s.name}</p>
              <p className="mt-1 text-sm text-slate-400">{s.desc}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h2 className="text-xl font-bold">Autor</h2>
        <p className="mt-2 text-slate-300">
          Alejandro Campos — Estudiante de Kodigo Academy, El Salvador.
        </p>
      </section>
    </div>
  );
}
