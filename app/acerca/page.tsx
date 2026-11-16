import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.nav.about };
}

export default async function AboutPage() {
  const { t } = await getI18n();
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{t.about.title}</h1>
        <p className="mt-3 text-slate-300">{t.about.intro}</p>
      </div>

      <section>
        <h2 className="mb-4 text-xl font-bold">{t.about.stack}</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {t.about.items.map((s) => (
            <li key={s.name} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="font-semibold text-brand-400">{s.name}</p>
              <p className="mt-1 text-sm text-slate-400">{s.desc}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h2 className="text-xl font-bold">{t.about.author}</h2>
        <p className="mt-2 text-slate-300">{t.about.authorText}</p>
      </section>
    </div>
  );
}
