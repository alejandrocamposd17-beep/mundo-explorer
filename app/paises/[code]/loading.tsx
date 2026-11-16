import { getI18n } from "@/lib/i18n/server";

export default async function CountryLoading() {
  const { t } = await getI18n();
  return (
    <div className="space-y-8" role="status" aria-live="polite">
      <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="aspect-[3/2] animate-pulse rounded-2xl bg-white/10" />
        <div className="space-y-4">
          <div className="h-10 w-2/3 animate-pulse rounded bg-white/10" />
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-white/5" />
            ))}
          </div>
        </div>
      </div>
      <span className="sr-only">{t.detail.loadingCountry}</span>
    </div>
  );
}
