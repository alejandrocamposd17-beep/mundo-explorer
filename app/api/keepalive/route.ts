import { NextResponse, type NextRequest } from "next/server";

// Siempre se ejecuta (no se cachea): es el "latido" diario hacia Supabase
export const dynamic = "force-dynamic";

/**
 * GET /api/keepalive — lo llama el Cron de Vercel una vez al día (vercel.json).
 * Hace una consulta mínima a Supabase para que el proyecto gratuito no se pause por inactividad.
 * Si existe la variable CRON_SECRET, solo acepta llamadas con ese token (las que hace Vercel Cron).
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || !/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url)) {
    return NextResponse.json({ ok: false, reason: "supabase-not-configured" });
  }

  try {
    // RLS hace que un usuario anónimo no vea filas, pero la consulta cuenta como actividad
    const res = await fetch(`${url}/rest/v1/favorites?select=cca3&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    return NextResponse.json({ ok: res.ok, status: res.status, at: new Date().toISOString() });
  } catch {
    return NextResponse.json({ ok: false, reason: "request-failed" }, { status: 502 });
  }
}
