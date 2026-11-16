import Link from "next/link";
import { getI18n } from "@/lib/i18n/server";

export default async function NotFound() {
  const { t } = await getI18n();
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center text-center">
      <p className="font-display text-6xl font-extrabold text-brand-400">404</p>
      <h1 className="mt-4 text-2xl font-bold">{t.errors.notFoundTitle}</h1>
      <p className="mt-2 text-slate-400">{t.errors.notFoundText}</p>
      <Link href="/paises" className="mt-6 rounded-xl bg-brand-600 px-4 py-2 font-semibold text-[#fff] hover:bg-brand-500">
        {t.errors.notFoundCta}
      </Link>
    </div>
  );
}
