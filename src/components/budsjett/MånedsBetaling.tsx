"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MÅNEDER, type BudsjettKategori, type BudsjettMåned } from "@/lib/budsjett";

const FASTE_TYPER = ["fast", "gjeld", "abonnement"] as const;
const INNTEKT_TYPER = ["inntekt"] as const;

export default function MånedsBetaling({
  userId,
  kategorier,
  eksisterendeAvvik,
  år,
}: {
  userId: string;
  kategorier: BudsjettKategori[];
  eksisterendeAvvik: BudsjettMåned[];
  år: number;
}) {
  const nå = new Date();
  const [maned, setManed] = useState(nå.getMonth() + 1);
  const [avvik, setAvvik] = useState<BudsjettMåned[]>(eksisterendeAvvik);
  const [lagrer, setLagrer] = useState<string | null>(null);

  const fasteKategorier = kategorier.filter(k => FASTE_TYPER.includes(k.type as typeof FASTE_TYPER[number]) && k.aktiv);
  const inntektKategorier = kategorier.filter(k => INNTEKT_TYPER.includes(k.type as typeof INNTEKT_TYPER[number]) && k.aktiv);
  const månedAvvik = avvik.filter(a => a.maned === maned);

  function beløpForPost(k: BudsjettKategori): number {
    const override = månedAvvik.find(a => a.kategori_id === k.id);
    return override ? override.belop : k.standard_beløp;
  }

  function erBetalt(k: BudsjettKategori): boolean {
    return månedAvvik.some(a => a.kategori_id === k.id && a.belop !== null);
  }

  async function toggleBetalt(k: BudsjettKategori) {
    const eksisterende = månedAvvik.find(a => a.kategori_id === k.id);
    setLagrer(k.id);
    const supabase = createClient();

    if (eksisterende) {
      await supabase.from("budsjett_maneder").delete().eq("id", eksisterende.id);
      setAvvik(prev => prev.filter(a => a.id !== eksisterende.id));
    } else {
      const { data } = await supabase
        .from("budsjett_maneder")
        .upsert({
          user_id: userId,
          kategori_id: k.id,
          ar: år,
          maned,
          belop: k.standard_beløp,
        })
        .select()
        .single();
      if (data) setAvvik(prev => [...prev, data as BudsjettMåned]);
    }
    setLagrer(null);
  }

  async function oppdaterBeløp(k: BudsjettKategori, verdi: string) {
    const beløp = Number(verdi) || 0;
    const eksisterende = månedAvvik.find(a => a.kategori_id === k.id);
    setLagrer(k.id);
    const supabase = createClient();

    const { data } = await supabase
      .from("budsjett_maneder")
      .upsert({
        ...(eksisterende ? { id: eksisterende.id } : {}),
        user_id: userId,
        kategori_id: k.id,
        ar: år,
        maned,
        belop: beløp,
      })
      .select()
      .single();
    if (data) setAvvik(prev => [...prev.filter(a => a.id !== eksisterende?.id), data as BudsjettMåned]);
    setLagrer(null);
  }

  const antallBetalt = fasteKategorier.filter(k => erBetalt(k)).length;
  const totalBetalt = fasteKategorier.filter(k => erBetalt(k)).reduce((s, k) => s + beløpForPost(k), 0);
  const totalGjenstår = fasteKategorier.filter(k => !erBetalt(k)).reduce((s, k) => s + k.standard_beløp, 0);
  const antallInntektBekreftet = inntektKategorier.filter(k => erBetalt(k)).length;
  const totalInntektBekreftet = inntektKategorier.filter(k => erBetalt(k)).reduce((s, k) => s + beløpForPost(k), 0);

  return (
    <div>
      {/* Månedsvelger — bare frem og tilbake */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setManed(m => m > 1 ? m - 1 : 12)}
          className="w-10 h-10 rounded-full flex items-center justify-center text-base"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
        >
          ←
        </button>
        <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-lora)", color: "var(--text-primary)" }}>
          {MÅNEDER[maned - 1]} {år}
        </h2>
        <button
          onClick={() => setManed(m => m < 12 ? m + 1 : 1)}
          className="w-10 h-10 rounded-full flex items-center justify-center text-base"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
        >
          →
        </button>
        {maned !== nå.getMonth() + 1 && (
          <button
            onClick={() => setManed(nå.getMonth() + 1)}
            className="text-xs px-3 py-1 rounded-full"
            style={{ background: "var(--accent-light)", color: "var(--accent)" }}
          >
            Gå til nå
          </button>
        )}
      </div>

      {/* Fremdrift */}
      <div className="rounded-2xl p-5 mb-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            {antallBetalt} av {fasteKategorier.length} betalt
          </span>
          <span className="text-sm font-semibold" style={{ color: "var(--green)" }}>
            {totalBetalt.toLocaleString("nb-NO")} kr ✓
          </span>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${fasteKategorier.length > 0 ? (antallBetalt / fasteKategorier.length) * 100 : 0}%`,
              background: "var(--green)",
            }}
          />
        </div>
        {totalGjenstår > 0 && (
          <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
            {totalGjenstår.toLocaleString("nb-NO")} kr gjenstår
          </p>
        )}
      </div>

      {/* Inntekter */}
      <div className="rounded-2xl overflow-hidden mb-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between px-5 py-3" style={{ background: "var(--green-light)", borderBottom: "1px solid var(--border)" }}>
          <span className="text-sm font-semibold" style={{ color: "var(--green)" }}>💰 Inntekter</span>
          <span className="text-sm font-bold" style={{ color: "var(--green)" }}>
            {antallInntektBekreftet}/{inntektKategorier.length} bekreftet · {totalInntektBekreftet.toLocaleString("nb-NO")} kr
          </span>
        </div>
        {inntektKategorier.map((k, idx) => {
          const bekreftet = erBetalt(k);
          const verdi = beløpForPost(k);
          const avviker = verdi !== k.standard_beløp;
          return (
            <div key={k.id} className="flex items-center gap-3 px-4 py-4 md:px-5 md:gap-4"
              style={{
                borderBottom: idx < inntektKategorier.length - 1 ? "1px solid var(--border)" : "none",
                background: bekreftet ? "var(--green-light)" : "transparent",
                opacity: lagrer === k.id ? 0.6 : 1,
                transition: "background 0.2s",
              }}>
              <button onClick={() => toggleBetalt(k)}
                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all"
                style={{ background: bekreftet ? "var(--green)" : "transparent", border: `2px solid ${bekreftet ? "var(--green)" : "var(--border)"}`, color: "white" }}>
                {bekreftet && "✓"}
              </button>
              <div className="flex-1">
                <span className="text-sm font-medium"
                  style={{ color: bekreftet ? "var(--green)" : "var(--text-primary)", textDecoration: bekreftet ? "line-through" : "none", opacity: bekreftet ? 0.7 : 1 }}>
                  {k.navn}
                </span>
                {k.eier && k.eier !== "felles" && (
                  <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full" style={{ background: "var(--accent-light)", color: "var(--accent)" }}>{k.eier}</span>
                )}
                {avviker && (
                  <span className="ml-2 text-xs" style={{ color: "var(--amber)" }}>budsjettert: {k.standard_beløp.toLocaleString("nb-NO")} kr</span>
                )}
              </div>
              <input type="number" defaultValue={verdi || ""} key={`${k.id}-${maned}`}
                onBlur={(e) => { const ny = Number(e.target.value) || 0; if (ny !== verdi) oppdaterBeløp(k, e.target.value); e.target.style.borderColor = "var(--border)"; }}
                onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; if (!bekreftet) toggleBetalt(k); }}
                className="w-24 md:w-32 text-right text-sm px-3 py-1.5 rounded-lg outline-none"
                style={{ background: avviker ? "white" : "var(--background)", border: `1px solid ${avviker ? "var(--amber)" : "var(--border)"}`, color: avviker ? "var(--amber)" : "var(--text-primary)" }} />
            </div>
          );
        })}
      </div>

      {/* Faste posterader */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        {fasteKategorier.map((k, idx) => {
          const betalt = erBetalt(k);
          const verdi = beløpForPost(k);
          const avviker = verdi !== k.standard_beløp;

          return (
            <div
              key={k.id}
              className="flex items-center gap-3 px-4 py-4 md:px-5 md:gap-4"
              style={{
                borderBottom: idx < fasteKategorier.length - 1 ? "1px solid var(--border)" : "none",
                background: betalt ? "var(--green-light)" : "transparent",
                opacity: lagrer === k.id ? 0.6 : 1,
                transition: "background 0.2s",
              }}
            >
              {/* Avkrysning */}
              <button
                onClick={() => toggleBetalt(k)}
                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all"
                style={{
                  background: betalt ? "var(--green)" : "transparent",
                  border: `2px solid ${betalt ? "var(--green)" : "var(--border)"}`,
                  color: "white",
                }}
              >
                {betalt && "✓"}
              </button>

              {/* Navn */}
              <div className="flex-1">
                <span
                  className="text-sm font-medium"
                  style={{
                    color: betalt ? "var(--green)" : "var(--text-primary)",
                    textDecoration: betalt ? "line-through" : "none",
                    opacity: betalt ? 0.7 : 1,
                  }}
                >
                  {k.navn}
                </span>
                {k.eier && k.eier !== "felles" && (
                  <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full" style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
                    {k.eier}
                  </span>
                )}
                {avviker && (
                  <span className="ml-2 text-xs" style={{ color: "var(--amber)" }}>
                    standard: {k.standard_beløp.toLocaleString("nb-NO")} kr
                  </span>
                )}
              </div>

              {/* Beløp — alltid redigerbart */}
              <input
                type="number"
                defaultValue={verdi || ""}
                key={`${k.id}-${maned}`}
                onBlur={(e) => {
                  const ny = Number(e.target.value) || 0;
                  if (ny !== verdi) oppdaterBeløp(k, e.target.value);
                  e.target.style.borderColor = "var(--border)";
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--accent)";
                  if (!betalt) toggleBetalt(k); // merk som betalt når du begynner å redigere
                }}
                className="w-24 md:w-32 text-right text-sm px-3 py-1.5 rounded-lg outline-none"
                style={{
                  background: avviker ? "white" : "var(--background)",
                  border: `1px solid ${avviker ? "var(--amber)" : "var(--border)"}`,
                  color: avviker ? "var(--amber)" : "var(--text-primary)",
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
