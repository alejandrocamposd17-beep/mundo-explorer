import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center text-center">
      <p className="text-6xl font-extrabold text-brand-400">404</p>
      <h1 className="mt-4 text-2xl font-bold">Página no encontrada</h1>
      <p className="mt-2 text-slate-400">El país o la página que buscas no existe.</p>
      <Link href="/paises" className="mt-6 rounded-xl bg-brand-600 px-4 py-2 font-semibold hover:bg-brand-500">
        Ver países
      </Link>
    </div>
  );
}
