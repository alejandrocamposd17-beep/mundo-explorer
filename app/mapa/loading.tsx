import { getI18n } from "@/lib/i18n/server";

export default async function MapLoading() {
  const { t } = await getI18n();
  return (
    <div className="space-y-4" role="status" aria-live="polite">
      <div className="h-9 w-56 animate-pulse rounded bg-white/10" />
      <div className="h-[70vh] animate-pulse rounded-2xl bg-white/5" />
      <span className="sr-only">{t.common.loading}</span>
    </div>
  );
}
