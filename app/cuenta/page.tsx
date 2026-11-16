"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { fmt } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/client";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

const EMAIL_REGEX = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/;

type Status = "idle" | "sending" | "sent" | "error" | "invalid";

/** Inicio de sesión sin contraseña (enlace mágico por correo) con Supabase Auth. */
export default function AccountPage() {
  const { t } = useI18n();
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = getSupabase();
    const value = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(value)) {
      setStatus("invalid");
      return;
    }
    if (!supabase) return;
    setStatus("sending");
    const { error } = await supabase.auth.signInWithOtp({
      email: value,
      options: { emailRedirectTo: `${window.location.origin}/cuenta`, shouldCreateUser: true },
    });
    setStatus(error ? "error" : "sent");
  };

  const signOut = async () => {
    await getSupabase()?.auth.signOut();
    setUser(null);
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t.account.title}</h1>
        <p className="mt-2 text-slate-400">{t.account.subtitle}</p>
      </div>

      {!isSupabaseConfigured ? (
        <p className="rounded-2xl border border-white/10 bg-white/5 p-5 text-slate-300">ℹ️ {t.account.notConfigured}</p>
      ) : user ? (
        <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="font-semibold">✅ {fmt(t.account.signedAs, { email: user.email ?? "" })}</p>
          <p className="text-sm text-slate-400">☁️ {t.account.syncInfo}</p>
          <button
            type="button"
            onClick={signOut}
            className="rounded-xl border border-white/20 px-4 py-2 font-semibold hover:bg-white/10"
          >
            {t.account.signOut}
          </button>
        </div>
      ) : (
        <form onSubmit={send} className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6" noValidate>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-400">{t.account.email}</span>
            <input
              type="email"
              required
              autoComplete="email"
              maxLength={254}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status !== "sending") setStatus("idle");
              }}
              className="rounded-lg border border-white/15 bg-slate-900 px-3 py-2 outline-none focus:border-brand-400"
            />
          </label>
          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full rounded-xl bg-brand-600 px-4 py-2.5 font-semibold text-[#fff] hover:bg-brand-500 disabled:opacity-60"
          >
            {status === "sending" ? t.account.sending : t.account.send}
          </button>
          <p aria-live="polite" className="text-sm">
            {status === "sent" && <span className="text-emerald-300">📬 {t.account.sent}</span>}
            {status === "invalid" && <span className="text-red-300">{t.account.invalidEmail}</span>}
            {status === "error" && <span className="text-red-300">{t.account.error}</span>}
          </p>
        </form>
      )}
    </div>
  );
}
