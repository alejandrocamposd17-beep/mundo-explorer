"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Option = { cca3: string; name: string };

export default function CompareSelector({ options, a, b }: { options: Option[]; a?: string; b?: string }) {
  const router = useRouter();
  const [first, setFirst] = useState(a ?? "");
  const [second, setSecond] = useState(b ?? "");

  const update = (nextA: string, nextB: string) => {
    const params = new URLSearchParams();
    if (nextA) params.set("a", nextA.toLowerCase());
    if (nextB) params.set("b", nextB.toLowerCase());
    const query = params.toString();
    router.push(query ? `/comparar?${query}` : "/comparar");
  };

  const select = (value: string, onChange: (v: string) => void, label: string) => (
    <label className="flex flex-1 flex-col gap-1 text-sm">
      <span className="text-slate-400">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-white/15 bg-slate-900 px-3 py-2 outline-none focus:border-brand-400"
      >
        <option value="">Selecciona un país…</option>
        {options.map((o) => (
          <option key={o.cca3} value={o.cca3}>
            {o.name}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-end">
      {select(first, (v) => { setFirst(v); update(v, second); }, "País A")}
      <button
        type="button"
        onClick={() => {
          setFirst(second);
          setSecond(first);
          update(second, first);
        }}
        className="rounded-lg border border-white/15 px-3 py-2 text-sm hover:bg-white/10"
        aria-label="Intercambiar países"
      >
        ⇄
      </button>
      {select(second, (v) => { setSecond(v); update(first, v); }, "País B")}
    </div>
  );
}
