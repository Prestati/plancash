"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ResetPassordPage() {
  const [passord, setPassord] = useState("");
  const [bekreft, setBekreft] = useState("");
  const [lagrer, setLagrer] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);
  const [ferdig, setFerdig] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (passord !== bekreft) {
      setFeil("Passordene er ikke like.");
      return;
    }
    if (passord.length < 6) {
      setFeil("Passordet må være minst 6 tegn.");
      return;
    }
    setLagrer(true);
    setFeil(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: passord });
    setLagrer(false);
    if (error) {
      setFeil(error.message);
    } else {
      setFerdig(true);
      setTimeout(() => router.push("/dashboard"), 2000);
    }
  }

  return (
    <div className="min-h-screen flex flex-col px-5 pt-16 pb-10" style={{ background: "var(--background)" }}>
      <div className="flex justify-center mb-10">
        <Link href="/" className="flex items-center gap-2.5">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-lg"
            style={{ background: "var(--accent)" }}
          >
            ₪
          </div>
          <span className="text-2xl font-bold" style={{ fontFamily: "var(--font-lora)", color: "var(--text-primary)" }}>
            Plancash
          </span>
        </Link>
      </div>

      <div className="flex-1 flex flex-col max-w-sm mx-auto w-full">
        <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: "var(--font-lora)", color: "var(--text-primary)" }}>
          Nytt passord
        </h1>
        <p className="text-base mb-8" style={{ color: "var(--text-muted)" }}>
          Velg et nytt passord for kontoen din
        </p>

        {ferdig ? (
          <div className="p-4 rounded-2xl text-sm" style={{ background: "var(--green-light)", color: "var(--green)" }}>
            ✓ Passordet er oppdatert! Sender deg til dashbordet...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {feil && (
              <div className="p-4 rounded-2xl text-sm" style={{ background: "var(--red-light)", color: "var(--red)" }}>
                {feil}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                Nytt passord
              </label>
              <input
                type="password"
                value={passord}
                onChange={(e) => setPassord(e.target.value)}
                required
                placeholder="Minst 6 tegn"
                className="w-full px-4 py-4 rounded-2xl text-base outline-none"
                style={{ background: "var(--surface)", border: "1.5px solid var(--border)", color: "var(--text-primary)" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                Bekreft passord
              </label>
              <input
                type="password"
                value={bekreft}
                onChange={(e) => setBekreft(e.target.value)}
                required
                placeholder="Skriv passordet igjen"
                className="w-full px-4 py-4 rounded-2xl text-base outline-none"
                style={{ background: "var(--surface)", border: "1.5px solid var(--border)", color: "var(--text-primary)" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>
            <button
              type="submit"
              disabled={lagrer}
              className="w-full py-4 rounded-2xl font-semibold text-base text-white disabled:opacity-50 active:opacity-80"
              style={{ background: "var(--accent)" }}
            >
              {lagrer ? "Lagrer..." : "Sett nytt passord →"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
