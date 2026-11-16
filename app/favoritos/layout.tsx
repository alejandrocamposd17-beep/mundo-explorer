import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.nav.favorites };
}

export default function FavoritesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
