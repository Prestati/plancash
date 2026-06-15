"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function EndrePassord() {
  const [åpen, setÅpen] = useState(false);
  const [nyttPassord, setNyttPassord] = useState("");
  const [bekreft, setBekreft] = useState("");
  const [lagrer, setLagrer] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);
  const [ferdig, setFerdig] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (nyttPassord !== bekreft) {
      setFeil("Passordene er ikke like.");
      return;
    }
    if (nyttPassord.length < 6) {
      setFeil("Passordet må være minst 6 tegn.");
      return;
    }
    setLagrer(true);
    setFeil(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: nyttPassord });
    setLagrer(false);
    if (error) {
      setFeil(error.message);
    } else {
      setFerdig(true);
      setNyttPassord("");
      setBekreft("");
      setTimeout(() => { setFerdig(false); setÅpen(false); }, 2000);
    }
  }

  const inputStyle = {
    background: "var(--background)",
    border: "1.5px solid var(--border)",
    color: "var(--text-primary)",
    width: "100%",
    padding: "10px 14px",
    borderRadius: "12px",
    fontSize: "14px",
    outline: "none",
  };

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Passord</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Endre passordet ditt</p>
        </div>
        {!åpen && (
          <button
            onClick={() => setÅpen(true)}
            className="text-sm font-medium px-4 py-2 rounded-xl"
            style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          >
            Endre
          </button>
        )}
      </div>

      {åpen && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {ferdig && (
            <div className="p-3 rounded-xl text-sm" style={{ background: "var(--green-light)", color: "var(--green)" }}>
              ✓ Passordet er oppdatert!
            </div>
          )}
          {feil && (
            <div className="p-3 rounded-xl text-sm" style={{ background: "var(--red-light)", color: "var(--red)" }}>
              {feil}
            </div>
          )}
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Nytt passord</label>
            <input
              type="password"
              value={nyttPassord}
              onChange={(e) => setNyttPassord(e.target.value)}
              placeholder="Minst 6 tegn"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Bekreft passord</label>
            <input
              type="password"
              value={bekreft}
              onChange={(e) => setBekreft(e.target.value)}
              placeholder="Skriv passordet igjen"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              required
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => { setÅpen(false); setFeil(null); setNyttPassord(""); setBekreft(""); }}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium"
              style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
            >
              Avbryt
            </button>
            <button
              type="submit"
              disabled={lagrer}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: "var(--accent)" }}
            >
              {lagrer ? "Lagrer..." : "Lagre passord"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
