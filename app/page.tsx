import Link from "next/link";
import CountryCard from "@/components/CountryCard";
import { getAllCountries, numberFmt } from "@/lib/countries";

const FEATURED = ["SLV", "MEX", "JPN", "ESP", "BRA", "CAN"];

export default async function HomePage() {
  const countries = await getAllCountries();
  const featured = countries.filter((c) => FEATURED.includes(c.cca3));
  const totalArea = countries.reduce((acc, c) => acc + c.area, 0);
  const regions = new Set(countries.map((c) => c.region)).size;

  return (
    <div className="space-y-14">
      <section className="force-dark rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-indigo-700 px-6 py-14 text-center shadow-xl sm:px-12">
        <p className="text-sm uppercase tracking-widest text-brand-100">Explora · Compara · Descubre</p>
        <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl">El mundo en la palma de tu mano</h1>
        <p className="mx-auto mt-4 max-w-2xl text-brand-50/90">
          Consulta datos de más de 240 países y territorios, revisa su clima actual y guarda tus
          destinos favoritos.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/paises" className="rounded-xl bg-white px-5 py-3 font-semibold text-brand-700 hover:bg-brand-50">
            Explorar países
          </Link>
          <Link href="/favoritos" className="rounded-xl border border-white/40 px-5 py-3 font-semibold hover:bg-white/10">
            Mis favoritos
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Países y territorios", value: numberFmt.format(countries.length) },
          { label: "Km² de superficie", value: numberFmt.format(Math.round(totalArea)) },
          { label: "Regiones", value: numberFmt.format(regions) },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
            <p className="text-3xl font-bold text-brand-400">{s.value}</p>
            <p className="mt-1 text-sm text-slate-400">{s.label}</p>
          </div>
        ))}
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-2xl font-bold">Destinos destacados</h2>
          <Link href="/paises" className="text-sm text-brand-400 hover:underline">
            Ver todos →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((c) => (
            <CountryCard
              key={c.cca3}
              cca3={c.cca3}
              name={c.name}
              flag={c.flagPng}
              region={c.region}
              capital={c.capital}
              area={c.area}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
