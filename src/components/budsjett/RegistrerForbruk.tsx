"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { BudsjettKategori } from "@/lib/budsjett";

interface ScanResultat {
  beløp: number;
  dato: string | null;
  butikk: string | null;
  beskrivelse: string | null;
}

export default function RegistrerForbruk({
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
  const [modus, setModus] = useState<"manuell" | "kvittering">("manuell");
  const [skanner, setSkanner] = useState(false);
  const [scanResultat, setScanResultat] = useState<ScanResultat | null>(null);
  const [beløp, setBeløp] = useState("");
  const [dato, setDato] = useState(new Date().toISOString().split("T")[0]);
  const [beskrivelse, setBeskrivelse] = useState("");
  const [kategoriId, setKategoriId] = useState("");
  const [betaltAv, setBetaltAv] = useState("felles");
  const router = useRouter();
  const [lagrer, setLagrer] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);
  const [lagtTilBudsjett, setLagtTilBudsjett] = useState(false);
  const [leggerTilBudsjett, setLeggerTilBudsjett] = useState(false);
  const filRef = useRef<HTMLInputElement>(null);

  const forbrukKategorier = kategorier.filter(k => k.aktiv && k.type === "forbruk");
  const andreKategorier = kategorier.filter(k => k.aktiv && ["fast", "gjeld", "abonnement", "inntekt", "sparing"].includes(k.type));
  const valgtKategori = kategorier.find(k => k.id === kategoriId);
  const erFastType = valgtKategori && ["fast", "gjeld", "abonnement"].includes(valgtKategori.type);

  const personerFraKategorier = [...new Set(kategorier.map(k => k.eier).filter(e => e && e !== "felles"))] as string[];
  const betaltAvValg = ["felles", ...personerFraKategorier];

  async function leggTilIBudsjett() {
    if (!valgtKategori || !beløp) return;
    setLeggerTilBudsjett(true);
    const supabase = createClient();
    await supabase
      .from("budsjett_kategorier")
      .update({ "standard_beløp": Number(beløp) })
      .eq("id", valgtKategori.id);
    setLagtTilBudsjett(true);
    setLeggerTilBudsjett(false);
  }

  function lukk() {
    setÅpen(false);
    setScanResultat(null);
    setBeløp("");
    setBeskrivelse("");
    setKategoriId("");
    setBetaltAv("felles");
    setDato(new Date().toISOString().split("T")[0]);
    setFeil(null);
    setModus("manuell");
    setLagtTilBudsjett(false);
  }

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
        setModus("manuell");
      } else {
        setScanResultat(data);
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
      beskrivelse: beskrivelse || null,
      betalt_av: betaltAv,
      kilde: modus === "kvittering" ? "kvittering" : "manuell",
    });
    setLagrer(false);
    lukk();
    onLagret?.();
    router.refresh();
  }

  const inputStyle = {
    background: "var(--background)",
    border: "1px solid var(--border)",
    color: "var(--text-primary)",
  };

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
        <span style={{ fontSize: stor ? "22px" : "16px" }}>+</span>
        Registrer forbruk
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4" style={{ background: "rgba(42,31,20,0.5)" }}>
      <div className="w-full max-w-md rounded-2xl p-6 space-y-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-lora)", color: "var(--text-primary)" }}>
            Registrer forbruk
          </h2>
          <button onClick={lukk} className="text-xl leading-none" style={{ color: "var(--text-muted)" }}>✕</button>
        </div>

        {/* Modus-tabs */}
        <div className="flex gap-2 p-1 rounded-xl" style={{ background: "var(--background)" }}>
          <button
            onClick={() => { setModus("manuell"); setScanResultat(null); }}
            className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: modus === "manuell" ? "var(--surface)" : "transparent",
              color: modus === "manuell" ? "var(--accent)" : "var(--text-muted)",
              boxShadow: modus === "manuell" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            }}
          >
            ✏️ Logg manuelt
          </button>
          <button
            onClick={() => setModus("kvittering")}
            className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: modus === "kvittering" ? "var(--surface)" : "transparent",
              color: modus === "kvittering" ? "var(--accent)" : "var(--text-muted)",
              boxShadow: modus === "kvittering" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            }}
          >
            📷 Last opp kvittering
          </button>
        </div>

        {/* Kvittering-modus */}
        {modus === "kvittering" && !scanResultat && !skanner && (
          <div
            onClick={() => filRef.current?.click()}
            className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl cursor-pointer"
            style={{ border: "2px dashed var(--border)", background: "var(--background)" }}
          >
            <span className="text-4xl">🧾</span>
            <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Trykk for å velge bilde</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Ta bilde med kamera eller velg fra galleri</p>
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

        {scanResultat?.butikk && (
          <div className="p-3 rounded-xl text-sm" style={{ background: "var(--green-light)", color: "var(--green)" }}>
            ✓ Hentet fra: {scanResultat.butikk} — {scanResultat.beløp?.toLocaleString("nb-NO")} kr
          </div>
        )}

        {feil && (
          <div className="p-3 rounded-xl text-sm" style={{ background: "var(--red-light)", color: "var(--red)" }}>{feil}</div>
        )}

        {/* Skjema — alltid synlig i manuell-modus, etter scan i kvitteringsmodus */}
        {(modus === "manuell" || scanResultat || feil) && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Beløp (kr) *</label>
                <input
                  type="number"
                  value={beløp}
                  onChange={(e) => setBeløp(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={inputStyle}
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
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Hva gjelder det? (valgfritt)</label>
              <input
                type="text"
                value={beskrivelse}
                onChange={(e) => setBeskrivelse(e.target.value)}
                placeholder="f.eks. vin, lunsj, bensin, Rema dagligvare..."
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Kategori *</label>
              <select
                value={kategoriId}
                onChange={(e) => { setKategoriId(e.target.value); setLagtTilBudsjett(false); }}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={inputStyle}
              >
                <option value="">Velg kategori...</option>
                {forbrukKategorier.length > 0 && (
                  <optgroup label="Forbruk">
                    {forbrukKategorier.map(k => (
                      <option key={k.id} value={k.id}>{k.navn}{k.eier && k.eier !== "felles" ? ` (${k.eier})` : ""}</option>
                    ))}
                  </optgroup>
                )}
                {andreKategorier.length > 0 && (
                  <optgroup label="Andre kategorier">
                    {andreKategorier.map(k => (
                      <option key={k.id} value={k.id}>{k.navn}</option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            {/* Legg til i budsjett — vises kun for faste typer */}
            {erFastType && beløp && (
              <div
                className="rounded-xl p-4"
                style={{ background: "var(--amber-light)", border: "1px solid var(--amber)" }}
              >
                {lagtTilBudsjett ? (
                  <p className="text-sm font-medium" style={{ color: "var(--amber)" }}>
                    ✓ Lagt til i budsjett som {Number(beløp).toLocaleString("nb-NO")} kr/mnd
                  </p>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      Er dette en ny fast utgift? Legg den inn i budsjettet fra {new Date(dato).toLocaleDateString("nb-NO", { month: "long", year: "numeric" })}.
                    </p>
                    <button
                      onClick={leggTilIBudsjett}
                      disabled={leggerTilBudsjett}
                      className="shrink-0 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap disabled:opacity-50"
                      style={{ background: "var(--amber)", color: "white" }}
                    >
                      {leggerTilBudsjett ? "Lagrer..." : "+ Legg til i budsjett"}
                    </button>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Hvem betaler?</label>
              <div className="flex gap-2 flex-wrap">
                {betaltAvValg.map(p => (
                  <button
                    key={p}
                    onClick={() => setBetaltAv(p)}
                    className="flex-1 py-2 rounded-xl text-sm font-medium transition-all"
                    style={{
                      background: betaltAv === p ? "var(--accent)" : "var(--background)",
                      color: betaltAv === p ? "white" : "var(--text-secondary)",
                      border: `1px solid ${betaltAv === p ? "var(--accent)" : "var(--border)"}`,
                    }}
                  >
                    {p === "felles" ? "🏠 Felles" : p}
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
              {lagrer ? "Lagrer..." : "Lagre →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
