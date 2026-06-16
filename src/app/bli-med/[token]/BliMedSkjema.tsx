"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function BliMedSkjema({ token, epost }: { token: string; epost: string }) {
  const [email, setEmail] = useState(epost ?? "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visLoggInn, setVisLoggInn] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();

    if (visLoggInn) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError("Feil e-post eller passord"); setLoading(false); return; }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) { setError(error.message); setLoading(false); return; }
    }

    // Aksepter invitasjonen via API
    const aksepterRes = await fetch(`/api/aksepter-invitasjon`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    if (!aksepterRes.ok) {
      const json = await aksepterRes.json().catch(() => ({}));
      setError(json.feil ?? "Kunne ikke koble deg til husholdet. Be om en ny invitasjonslenke.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-lg" style={{ background: "var(--accent)" }}>₪</div>
          <span className="text-2xl font-bold" style={{ fontFamily: "var(--font-lora)", color: "var(--text-primary)" }}>Plancash</span>
        </div>

        {/* Invitasjonsmelding */}
        <div className="mb-6 p-4 rounded-2xl text-center" style={{ background: "var(--accent-light)", border: "1.5px solid var(--accent)" }}>
          <p className="text-2xl mb-2">🎉</p>
          <p className="font-semibold" style={{ color: "var(--accent)" }}>Du er invitert til Plancash!</p>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            {visLoggInn ? "Logg inn for å få tilgang til familiebudsjettet." : "Opprett en konto for å få tilgang til familiebudsjettet."}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-2xl text-sm" style={{ background: "var(--red-light)", color: "var(--red)" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>E-post</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full px-4 py-4 rounded-2xl text-base outline-none"
              style={{ background: "var(--surface)", border: "1.5px solid var(--border)", color: "var(--text-primary)" }}
              onFocus={e => e.target.style.borderColor = "var(--accent)"}
              onBlur={e => e.target.style.borderColor = "var(--border)"}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Passord</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
              placeholder="Minst 6 tegn"
              className="w-full px-4 py-4 rounded-2xl text-base outline-none"
              style={{ background: "var(--surface)", border: "1.5px solid var(--border)", color: "var(--text-primary)" }}
              onFocus={e => e.target.style.borderColor = "var(--accent)"}
              onBlur={e => e.target.style.borderColor = "var(--border)"}
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full py-4 rounded-2xl font-semibold text-base text-white disabled:opacity-50"
            style={{ background: "var(--accent)" }}
          >
            {loading ? "Laster..." : visLoggInn ? "Logg inn →" : "Opprett konto og bli med →"}
          </button>
        </form>

        <p className="mt-6 text-sm text-center" style={{ color: "var(--text-muted)" }}>
          {visLoggInn ? "Ny bruker?" : "Har du allerede konto?"}{" "}
          <button onClick={() => { setVisLoggInn(!visLoggInn); setError(null); }}
            className="font-medium underline underline-offset-2" style={{ color: "var(--accent)" }}>
            {visLoggInn ? "Opprett konto" : "Logg inn i stedet"}
          </button>
        </p>
      </div>
    </div>
  );
}
