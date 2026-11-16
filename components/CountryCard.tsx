import Link from "next/link";

type Props = {
  cca3: string;
  name: string;
  flag: string;
  flagAlt?: string;
  region: string;
  capital?: string;
  area: number;
};

const fmt = new Intl.NumberFormat("es-SV");

export default function CountryCard({ cca3, name, flag, flagAlt, region, capital, area }: Props) {
  return (
    <Link
      href={`/paises/${cca3.toLowerCase()}`}
      className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:-translate-y-1 hover:border-brand-400/60 hover:bg-white/10"
    >
      <div className="aspect-[3/2] overflow-hidden bg-slate-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={flag}
          alt={flagAlt || `Bandera de ${name}`}
          loading="lazy"
          className="h-full w-full object-cover transition group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <h3 className="truncate font-semibold">{name}</h3>
        <dl className="mt-2 space-y-1 text-sm text-slate-400">
          <div className="flex justify-between gap-2">
            <dt>Región</dt>
            <dd className="text-slate-200">{region || "—"}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt>Capital</dt>
            <dd className="truncate text-slate-200">{capital || "—"}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt>Área</dt>
            <dd className="text-slate-200">{fmt.format(area)} km²</dd>
          </div>
        </dl>
      </div>
    </Link>
  );
}
