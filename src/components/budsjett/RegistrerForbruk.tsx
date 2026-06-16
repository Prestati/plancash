"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { BudsjettKategori } from "@/lib/budsjett";

interface KvitteringGruppe {
  kategoriNavn: string;
  beløp: number;
  varer: string[];
}

interface ScanResultat {
  dato: string | null;
  butikk: string | null;
  totalBeløp: number;
  grupper: KvitteringGruppe[];
}

interface GruppeValg {
  gruppe: KvitteringGruppe;
  kategoriId: string;
  betaltAv: string;
  beskrivelse: string;
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
  const [gruppeValg, setGruppeValg] = useState<GruppeValg[]>([]);

  // Manuell-modus state
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
    setGruppeValg([]);
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
        // Initialiser gruppevalg med tom kategori per gruppe
        setGruppeValg(
          (data.grupper ?? []).map((g: KvitteringGruppe) => ({
            gruppe: g,
            kategoriId: "",
            betaltAv: "felles",
            beskrivelse: g.kategoriNavn,
          }))
        );
        setDato(data.dato || new Date().toISOString().split("T")[0]);
      }
    };
    reader.readAsDataURL(fil);
  }

  function oppdaterGruppeValg(index: number, felt: "kategoriId" | "betaltAv" | "beskrivelse", verdi: string) {
    setGruppeValg(prev => prev.map((gv, i) => i === index ? { ...gv, [felt]: verdi } : gv));
  }

  async function lagreKvittering() {
    if (gruppeValg.some(gv => !gv.kategoriId)) {
      setFeil("Velg kategori for alle grupper før du lagrer.");
      return;
    }
    setLagrer(true);
    setFeil(null);
    const supabase = createClient();
    const lagringsDato = scanResultat?.dato || new Date().toISOString().split("T")[0];

    const inserts = gruppeValg.map(gv => ({
      user_id: userId,
      kategori: gv.kategoriId,
      dato: lagringsDato,
      beløp: gv.gruppe.beløp,
      beskrivelse: gv.beskrivelse || gv.gruppe.kategoriNavn,
      betalt_av: gv.betaltAv,
      kilde: "kvittering",
    }));

    const { data: lagretData, error } = await supabase.from("transaksjoner").insert(inserts).select();
    console.log("Insert transaksjoner:", { lagretData, error });
    setLagrer(false);
    if (error) {
      setFeil("Kunne ikke lagre: " + error.message);
      return;
    }
    lukk();
    onLagret?.();
    router.refresh();
  }

  async function lagreManuell() {
    if (!beløp || !kategoriId) return;
    setLagrer(true);
    const supabase = createClient();
    const { error } = await supabase.from("transaksjoner").insert({
      user_id: userId,
      kategori: kategoriId,
      dato,
      beløp: Number(beløp),
      beskrivelse: beskrivelse || null,
      betalt_av: betaltAv,
      kilde: "manuell",
    });
    setLagrer(false);
    if (error) {
      setFeil("Kunne ikke lagre: " + error.message);
      return;
    }
    lukk();
    onLagret?.();
    router.refresh();
  }

  const inputStyle = {
    background: "var(--background)",
    border: "1px solid var(--border)",
    color: "var(--text-primary)",
    fontSize: "16px", // hindrer iOS fra å zoome inn på focus
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
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" style={{ background: "rgba(42,31,20,0.5)" }}>
      <div
        className="w-full max-w-md rounded-t-2xl md:rounded-2xl flex flex-col"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          maxHeight: "88vh",
        }}
      >
        {/* Header — fast */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 shrink-0">
          <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-lora)", color: "var(--text-primary)" }}>
            Registrer forbruk
          </h2>
          <button onClick={lukk} className="text-xl leading-none" style={{ color: "var(--text-muted)" }}>✕</button>
        </div>

        {/* Scrollbart innhold */}
        <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-4">

        {/* Modus-tabs */}
        <div className="flex gap-2 p-1 rounded-xl" style={{ background: "var(--background)" }}>
          <button
            onClick={() => { setModus("manuell"); setScanResultat(null); setGruppeValg([]); }}
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

        {/* Kvittering-modus: last opp */}
        {modus === "kvittering" && !scanResultat && !skanner && (
          <div
            className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl"
            style={{ border: "2px dashed var(--border)", background: "var(--background)", position: "relative" }}
          >
            <span className="text-4xl">🧾</span>
            <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Trykk for å velge bilde</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Ta bilde med kamera eller velg fra galleri</p>
            <input
              ref={filRef}
              type="file"
              accept="image/*"
              style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" }}
              onChange={(e) => e.target.files?.[0] && håndterBilde(e.target.files[0])}
            />
          </div>
        )}

        {skanner && (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="text-3xl animate-pulse">🔍</div>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Leser kvitteringen og sorterer varene...</p>
          </div>
        )}

        {feil && (
          <div className="p-3 rounded-xl text-sm" style={{ background: "var(--red-light)", color: "var(--red)" }}>{feil}</div>
        )}

        {/* Kvittering-resultat: gruppevisning */}
        {modus === "kvittering" && scanResultat && gruppeValg.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  {scanResultat.butikk ?? "Kvittering"}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {scanResultat.dato ?? "Ukjent dato"} · Totalt {scanResultat.totalBeløp?.toLocaleString("nb-NO")} kr
                </p>
              </div>
              <div
                className="text-xs px-3 py-1.5 rounded-lg"
                style={{ background: "var(--background)", color: "var(--text-muted)", border: "1px solid var(--border)", position: "relative" }}
              >
                Bytt bilde
                <input
                  ref={filRef}
                  type="file"
                  accept="image/*"
                  style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" }}
                  onChange={(e) => e.target.files?.[0] && håndterBilde(e.target.files[0])}
                />
              </div>
            </div>

            <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
              Velg hvilken budsjett-kategori hver gruppe skal gå på:
            </p>

            {gruppeValg.map((gv, i) => (
              <div
                key={i}
                className="rounded-xl p-4 space-y-3"
                style={{ background: "var(--background)", border: "1px solid var(--border)" }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>
                      {gv.gruppe.varer.join(", ")}
                    </p>
                    <input
                      type="text"
                      value={gv.beskrivelse}
                      onChange={(e) => oppdaterGruppeValg(i, "beskrivelse", e.target.value)}
                      placeholder="Hva gjelder det?"
                      className="w-full px-2 py-1.5 rounded-lg outline-none"
                      style={{ ...inputStyle, fontSize: "16px" }}
                    />
                  </div>
                  <span className="text-sm font-bold shrink-0 ml-2" style={{ color: "var(--accent)" }}>
                    {gv.gruppe.beløp.toLocaleString("nb-NO")} kr
                  </span>
                </div>

                <select
                  value={gv.kategoriId}
                  onChange={(e) => oppdaterGruppeValg(i, "kategoriId", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
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

                {betaltAvValg.length > 1 && (
                  <div className="flex gap-2">
                    {betaltAvValg.map(p => (
                      <button
                        key={p}
                        onClick={() => oppdaterGruppeValg(i, "betaltAv", p)}
                        className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{
                          background: gv.betaltAv === p ? "var(--accent)" : "var(--surface)",
                          color: gv.betaltAv === p ? "white" : "var(--text-secondary)",
                          border: `1px solid ${gv.betaltAv === p ? "var(--accent)" : "var(--border)"}`,
                        }}
                      >
                        {p === "felles" ? "🏠 Felles" : p}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

          </div>
        )}

        {/* Manuell-modus */}
        {modus === "manuell" && (
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

            {erFastType && beløp && (
              <div className="rounded-xl p-4" style={{ background: "var(--amber-light)", border: "1px solid var(--amber)" }}>
                {lagtTilBudsjett ? (
                  <p className="text-sm font-medium" style={{ color: "var(--amber)" }}>
                    ✓ Lagt til i budsjett som {Number(beløp).toLocaleString("nb-NO")} kr/mnd
                  </p>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      Er dette en ny fast utgift? Legg den inn i budsjettet.
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

          </div>
        )}

        </div>{/* slutt scrollbart innhold */}

        {/* Sticky lagre-knapp */}
        {modus === "manuell" && (
          <div className="px-6 py-4 shrink-0" style={{ borderTop: "1px solid var(--border)" }}>
            <button
              onClick={lagreManuell}
              disabled={!beløp || !kategoriId || lagrer}
              className="w-full py-3.5 rounded-xl font-semibold text-white text-base disabled:opacity-40"
              style={{ background: "var(--accent)" }}
            >
              {lagrer ? "Lagrer..." : "Lagre →"}
            </button>
          </div>
        )}
        {modus === "kvittering" && scanResultat && gruppeValg.length > 0 && (
          <div className="px-6 py-4 shrink-0" style={{ borderTop: "1px solid var(--border)" }}>
            <button
              onClick={lagreKvittering}
              disabled={gruppeValg.some(gv => !gv.kategoriId) || lagrer}
              className="w-full py-3.5 rounded-xl font-semibold text-white text-base disabled:opacity-40"
              style={{ background: "var(--accent)" }}
            >
              {lagrer ? "Lagrer..." : `Lagre ${gruppeValg.length} poster →`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
