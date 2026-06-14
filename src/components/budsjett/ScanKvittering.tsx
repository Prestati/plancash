"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { BudsjettKategori } from "@/lib/budsjett";

interface ScanResultat {
  beløp: number;
  dato: string | null;
  butikk: string | null;
  beskrivelse: string | null;
}

export default function ScanKvittering({
  userId,
  kategorier,
  onLagret,
  variant = "standard",
  stor = false,
}: {
  userId: string;
  kategorier: BudsjettKategori[];
  onLagret?: () => void;
  variant?: "standard" | "hvit";
  stor?: boolean;
}) {
  const [åpen, setÅpen] = useState(false);
  const [skanner, setSkanner] = useState(false);
  const [resultat, setResultat] = useState<ScanResultat | null>(null);
  const [beløp, setBeløp] = useState("");
  const [dato, setDato] = useState(new Date().toISOString().split("T")[0]);
  const [beskrivelse, setBeskrivelse] = useState("");
  const [kategoriId, setKategoriId] = useState("");
  const [betaltAv, setBetaltAv] = useState("felles");
  const [lagrer, setLagrer] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);
  const filRef = useRef<HTMLInputElement>(null);

  const forbrukKategorier = kategorier.filter(k => k.aktiv);

  async function håndterBilde(fil: File) {
    setSkanner(true);
    setFeil(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = (e.target?.result as string).split(",")[1];
      const mediaType = fil.type as "image/jpeg" | "image/png" | "image/webp";

      const res = await fetch("/api/scan-kvittering", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bildeBase64: base64, mediaType }),
      });

      const data = await res.json();
      setSkanner(false);

      if (data.feil) {
        setFeil("Klarte ikke lese kvitteringen — fyll inn manuelt.");
      } else {
        setResultat(data);
        setBeløp(String(data.beløp || ""));
        setDato(data.dato || new Date().toISOString().split("T")[0]);
        setBeskrivelse(data.beskrivelse || data.butikk || "");
      }
    };
    reader.readAsDataURL(fil);
  }

  async function lagre() {
    if (!beløp || !kategoriId) return;
    setLagrer(true);
    const supabase = createClient();
    await supabase.from("transaksjoner").insert({
      user_id: userId,
      kategori_id: kategoriId,
      dato,
      beløp: Number(beløp),
      beskrivelse,
      betalt_av: betaltAv,
      kilde: "kvittering",
    });
    setLagrer(false);
    setÅpen(false);
    setResultat(null);
    setBeløp("");
    setBeskrivelse("");
    setKategoriId("");
    onLagret?.();
  }

  if (!åpen) {
    return (
      <button
        onClick={() => setÅpen(true)}
        className="flex items-center gap-2 font-semibold"
        style={{
          background: variant === "hvit" ? "rgba(255,255,255,0.2)" : "var(--accent)",
          color: "white",
          border: variant === "hvit" ? "1.5px solid rgba(255,255,255,0.4)" : "none",
          borderRadius: "14px",
          padding: stor ? "14px 24px" : "10px 16px",
          fontSize: stor ? "16px" : "14px",
        }}
      >
        <span style={{ fontSize: stor ? "22px" : "16px" }}>📷</span>
        Scan kvittering
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(42,31,20,0.4)" }}>
      <div className="w-full max-w-md rounded-2xl p-6 space-y-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-lora)", color: "var(--text-primary)" }}>
            📷 Scan kvittering
          </h2>
          <button onClick={() => setÅpen(false)} style={{ color: "var(--text-muted)" }}>✕</button>
        </div>

        {/* Bildeopplasting */}
        {!resultat && !skanner && (
          <div
            onClick={() => filRef.current?.click()}
            className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl cursor-pointer transition-all"
            style={{ border: "2px dashed var(--border)", background: "var(--background)" }}
          >
            <span className="text-4xl">🧾</span>
            <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              Trykk for å velge bilde
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Ta bilde med kamera eller velg fra galleri
            </p>
            <input
              ref={filRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && håndterBilde(e.target.files[0])}
            />
          </div>
        )}

        {skanner && (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="text-3xl animate-pulse">🔍</div>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Leser kvitteringen...</p>
          </div>
        )}

        {feil && (
          <div className="p-3 rounded-xl text-sm" style={{ background: "var(--red-light)", color: "var(--red)" }}>
            {feil}
          </div>
        )}

        {/* Skjema — vises etter scan eller ved feil */}
        {(resultat || feil) && (
          <div className="space-y-3">
            {resultat?.butikk && (
              <div className="p-3 rounded-xl text-sm" style={{ background: "var(--green-light)", color: "var(--green)" }}>
                ✓ Lest av: {resultat.butikk} — {resultat.beløp?.toLocaleString("nb-NO")} kr
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Beløp (kr)</label>
                <input
                  type="number"
                  value={beløp}
                  onChange={(e) => setBeløp(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Dato</label>
                <input
                  type="date"
                  value={dato}
                  onChange={(e) => setDato(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Beskrivelse</label>
              <input
                type="text"
                value={beskrivelse}
                onChange={(e) => setBeskrivelse(e.target.value)}
                placeholder="f.eks. Meny — dagligvare"
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Kategori</label>
              <select
                value={kategoriId}
                onChange={(e) => setKategoriId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              >
                <option value="">Velg kategori...</option>
                {forbrukKategorier.map(k => (
                  <option key={k.id} value={k.id}>{k.navn}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Betalt av</label>
              <div className="flex gap-2">
                {["felles", "Karoline", "Tobias"].map(p => (
                  <button
                    key={p}
                    onClick={() => setBetaltAv(p)}
                    className="flex-1 py-2 rounded-xl text-xs font-medium"
                    style={{
                      background: betaltAv === p ? "var(--accent)" : "var(--background)",
                      color: betaltAv === p ? "white" : "var(--text-secondary)",
                      border: `1px solid ${betaltAv === p ? "var(--accent)" : "var(--border)"}`,
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={lagre}
              disabled={!beløp || !kategoriId || lagrer}
              className="w-full py-3 rounded-xl font-semibold text-white text-sm disabled:opacity-40"
              style={{ background: "var(--accent)" }}
            >
              {lagrer ? "Lagrer..." : "Lagre transaksjon →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
