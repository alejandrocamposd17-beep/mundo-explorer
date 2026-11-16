import type { Metadata } from "next";

export const metadata: Metadata = { title: "Favoritos" };

export default function FavoritesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
