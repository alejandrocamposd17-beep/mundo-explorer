import { ImageResponse } from "next/og";
import { getCountryByCode, numberFmt } from "@/lib/countries";

export const alt = "Ficha del país en Mundo Explorer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Tarjeta para redes sociales: bandera, nombre y datos clave del país. */
export default async function Image({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const country = await getCountryByCode(code);
  const name = country?.name ?? "País no encontrado";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 60,
          padding: "70px 80px",
          background: "linear-gradient(135deg, #0b1220 0%, #10213f 60%, #1e1b4b 100%)",
          color: "white",
        }}
      >
        {country && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`https://flagcdn.com/w640/${country.cca2}.png`}
            width={420}
            height={280}
            style={{ borderRadius: 24, objectFit: "cover", boxShadow: "0 20px 60px rgba(0,0,0,.5)" }}
            alt=""
          />
        )}
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ display: "flex", fontSize: 28, color: "#4aa8ff", fontWeight: 700 }}>Mundo Explorer</div>
          <div style={{ display: "flex", fontSize: 72, fontWeight: 800, lineHeight: 1.05, marginTop: 12 }}>{name}</div>
          {country && (
            <div style={{ display: "flex", flexDirection: "column", marginTop: 28, fontSize: 30, color: "#cbd5e1", gap: 10 }}>
              <div style={{ display: "flex" }}>Capital: {country.capital ?? "—"}</div>
              <div style={{ display: "flex" }}>Región: {country.subregion ?? country.region}</div>
              <div style={{ display: "flex" }}>Área: {numberFmt.format(country.area)} km²</div>
            </div>
          )}
        </div>
      </div>
    ),
    size,
  );
}
