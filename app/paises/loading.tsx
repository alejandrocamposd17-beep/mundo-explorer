import { getI18n } from "@/lib/i18n/server";

export default async function CountriesLoading() {
  const { t } = await getI18n();
  return (
    <div role="status" aria-live="polite">
      <div className="h-9 w-64 animate-pulse rounded bg-white/10" />
      <div className="mt-3 mb-6 h-5 w-80 max-w-full animate-pulse rounded bg-white/5" />
      <div className="mb-6 h-24 animate-pulse rounded-2xl bg-white/5" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-white/10">
            <div className="aspect-[3/2] animate-pulse bg-white/10" />
            <div className="space-y-2 p-4">
              <div className="h-4 w-2/3 animate-pulse rounded bg-white/10" />
              <div className="h-3 w-full animate-pulse rounded bg-white/5" />
              <div className="h-3 w-full animate-pulse rounded bg-white/5" />
            </div>
          </div>
        ))}
      </div>
      <span className="sr-only">{t.countries.loadingList}</span>
    </div>
  );
}
