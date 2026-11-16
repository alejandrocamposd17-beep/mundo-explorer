import type { Metadata } from "next";
import QuizGame from "@/components/QuizGame";
import { getAllCountries } from "@/lib/countries";
import { getI18n } from "@/lib/i18n/server";
import type { QuizItem } from "@/lib/quiz";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.games.capitalsTitle };
}

export default async function Page() {
  const { locale } = await getI18n();
  const countries = await getAllCountries(locale);
  const items: QuizItem[] = countries.map((c) => ({
    cca3: c.cca3,
    name: c.name,
    capital: c.capital,
    flag: c.flagPng,
    region: c.region,
  }));
  return <QuizGame mode="capitals" items={items} />;
}
