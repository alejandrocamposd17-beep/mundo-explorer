import { ImageResponse } from "next/og";

export const alt = "Mundo Explorer — explora los países del mundo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const FLAGS = ["sv", "jp", "br", "ca", "es", "mx", "fr", "kr"];

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "70px 80px",
          background: "linear-gradient(135deg, #0a58b4 0%, #0b6fe0 45%, #4338ca 100%)",
          color: "white",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 34, fontWeight: 700 }}>
          <div style={{ width: 56, height: 56, borderRadius: 28, background: "#4aa8ff", border: "4px solid #eef7ff", display: "flex" }} />
          Mundo Explorer
        </div>
        <div style={{ display: "flex", marginTop: 34, fontSize: 76, fontWeight: 800, lineHeight: 1.05, maxWidth: 900 }}>
          El mundo en la palma de tu mano
        </div>
        <div style={{ display: "flex", marginTop: 24, fontSize: 30, color: "#d9edff" }}>
          250 países · clima en vivo · mapas · comparador
        </div>
        <div style={{ display: "flex", gap: 18, marginTop: 50 }}>
          {FLAGS.map((f) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={f} src={`https://flagcdn.com/w160/${f}.png`} width={96} height={64} style={{ borderRadius: 8 }} alt="" />
          ))}
        </div>
      </div>
    ),
    size,
  );
}
