"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center text-center">
      <p className="text-5xl" aria-hidden>
        ⚠️
      </p>
      <h1 className="mt-4 text-2xl font-bold">Algo salió mal</h1>
      <p className="mt-2 text-slate-400">
        No pudimos cargar esta sección. Puede ser un problema temporal con el servicio de datos.
      </p>
      {error.digest && <p className="mt-2 text-xs text-slate-500">Código: {error.digest}</p>}
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-xl bg-brand-600 px-4 py-2 font-semibold text-[#fff] hover:bg-brand-500"
        >
          Intentar de nuevo
        </button>
        <Link href="/" className="rounded-xl border border-white/20 px-4 py-2 font-semibold hover:bg-white/10">
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
