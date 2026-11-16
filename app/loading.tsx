import { getI18n } from "@/lib/i18n/server";

export default async function Loading() {
  const { t } = await getI18n();
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4" role="status" aria-live="polite">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-400 border-t-transparent" />
      <p className="text-slate-400">{t.common.loading}</p>
    </div>
  );
}
