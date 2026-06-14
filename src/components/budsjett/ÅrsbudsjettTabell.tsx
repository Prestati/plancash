"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  TYPE_CONFIG, MÅNEDER,
  type BudsjettKategori, type BudsjettMåned, type BudsjettType,
} from "@/lib/budsjett";

const TYPE_REKKEFØLGE: BudsjettType[] = ["inntekt", "fast", "gjeld", "abonnement", "forbruk", "sparing"];
const MND_KORT = ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Des"];

export default function ArsbudsjettTabell({
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
  const [avvik, setAvvik] = useState<BudsjettMåned[]>(eksisterendeAvvik);
  const [lagrer, setLagrer] = useState<string | null>(null);

  function beløpForCell(kategori: BudsjettKategori, maned: number): number {
    const override = avvik.find(a => a.kategori_id === kategori.id && a.maned === maned);
    return override ? override.belop : kategori.standard_beløp;
  }

  function erJustert(kategori: BudsjettKategori, maned: number): boolean {
    return avvik.some(a => a.kategori_id === kategori.id && a.maned === maned);
  }

  async function lagreCell(kategori: BudsjettKategori, maned: number, verdi: string) {
    const beløp = Number(verdi) || 0;
    const eksisterende = avvik.find(a => a.kategori_id === kategori.id && a.maned === maned);
    const cellKey = `${kategori.id}-${maned}`;
    setLagrer(cellKey);
    const supabase = createClient();

    if (beløp === kategori.standard_beløp) {
      if (eksisterende) {
        await supabase.from("budsjett_maneder").delete().eq("id", eksisterende.id);
        setAvvik(prev => prev.filter(a => a.id !== eksisterende.id));
      }
    } else {
      const { data } = await supabase
        .from("budsjett_maneder")
        .upsert({
          ...(eksisterende ? { id: eksisterende.id } : {}),
          user_id: userId,
          kategori_id: kategori.id,
          ar: år,
          maned,
          belop: beløp,
        })
        .select()
        .single();
      if (data) {
        setAvvik(prev => [...prev.filter(a => a.id !== eksisterende?.id), data as BudsjettMåned]);
      }
    }
    setLagrer(null);
  }

  // Summer per type per måned
  function sumTypePerMåned(type: BudsjettType, maned: number): number {
    return kategorier
      .filter(k => k.type === type && k.aktiv)
      .reduce((s, k) => s + beløpForCell(k, maned), 0);
  }

  // Balanse per måned
  function balansePerMåned(maned: number): number {
    const inntekt = sumTypePerMåned("inntekt", maned);
    const utgifter = TYPE_REKKEFØLGE
      .filter(t => t !== "inntekt")
      .reduce((s, t) => s + sumTypePerMåned(t, maned), 0);
    return inntekt - utgifter;
  }

  const nåMåned = new Date().getMonth() + 1;

  return (
    <div className="overflow-auto" style={{ maxHeight: "75vh" }}>
      <table className="w-full text-sm border-collapse" style={{ minWidth: "900px" }}>
        <thead>
          <tr className="sticky top-0 z-20">
            <th
              className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider sticky left-0 z-30"
              style={{ background: "var(--background)", color: "var(--text-muted)", minWidth: "180px", borderBottom: "2px solid var(--border)" }}
            >
              Kategori
            </th>
            {MND_KORT.map((m, i) => (
              <th
                key={m}
                className="px-2 py-3 text-xs font-semibold uppercase tracking-wider text-right"
                style={{
                  background: i + 1 === nåMåned ? "var(--accent-light)" : "var(--background)",
                  color: i + 1 === nåMåned ? "var(--accent)" : "var(--text-muted)",
                  borderBottom: "2px solid var(--border)",
                  minWidth: "80px",
                }}
              >
                {m}
              </th>
            ))}
            <th
              className="px-3 py-3 text-xs font-semibold uppercase tracking-wider text-right"
              style={{ background: "var(--background)", color: "var(--text-muted)", borderBottom: "2px solid var(--border)", minWidth: "90px" }}
            >
              Årstotal
            </th>
          </tr>
        </thead>
        <tbody>
          {TYPE_REKKEFØLGE.map((type) => {
            const kats = kategorier.filter(k => k.type === type && k.aktiv);
            if (kats.length === 0) return null;
            const cfg = TYPE_CONFIG[type];

            return (
              <React.Fragment key={type}>
                {/* Type-header */}
                <tr>
                  <td
                    colSpan={14}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider sticky left-0"
                    style={{ background: "var(--background)", color: `var(${cfg.farge})`, borderTop: "1px solid var(--border)" }}
                  >
                    {cfg.ikon} {cfg.label}
                  </td>
                </tr>

                {/* Kategorirader */}
                {kats.map((k) => {
                  const årstotal = Array.from({ length: 12 }, (_, i) => beløpForCell(k, i + 1)).reduce((s, v) => s + v, 0);
                  return (
                    <tr key={k.id} className="group" style={{ borderBottom: "1px solid var(--border)" }}>
                      <td
                        className="px-4 py-2 sticky left-0 z-10"
                        style={{ background: "var(--surface)", color: "var(--text-primary)", fontWeight: 500 }}
                      >
                        <div className="flex items-center gap-2">
                          <span>{k.navn}</span>
                          {k.eier && k.eier !== "felles" && (
                            <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
                              {k.eier}
                            </span>
                          )}
                        </div>
                      </td>
                      {Array.from({ length: 12 }, (_, i) => {
                        const maned = i + 1;
                        const justert = erJustert(k, maned);
                        const verdi = beløpForCell(k, maned);
                        const cellKey = `${k.id}-${maned}`;
                        const erNå = maned === nåMåned;
                        return (
                          <td
                            key={maned}
                            className="px-1 py-1"
                            style={{ background: justert ? "var(--amber-light)" : erNå ? "var(--accent-light)" : "var(--surface)" }}
                          >
                            <div className="relative">
                              {lagrer === cellKey && (
                                <span className="absolute -top-4 right-0 text-xs" style={{ color: "var(--text-muted)" }}>💾</span>
                              )}
                              <input
                                type="number"
                                defaultValue={verdi || ""}
                                key={`${k.id}-${maned}-${avvik.length}`}
                                onBlur={(e) => {
                                  const ny = Number(e.target.value) || 0;
                                  if (ny !== verdi) lagreCell(k, maned, e.target.value);
                                  e.target.style.borderColor = "transparent";
                                }}
                                onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                                className="w-full text-right text-sm px-2 py-1 rounded outline-none"
                                style={{
                                  background: "transparent",
                                  border: "1.5px solid transparent",
                                  color: justert ? "var(--amber)" : "var(--text-primary)",
                                  fontWeight: justert ? 600 : 400,
                                }}
                              />
                            </div>
                          </td>
                        );
                      })}
                      <td className="px-3 py-2 text-right font-semibold" style={{ background: "var(--background)", color: "var(--text-secondary)" }}>
                        {årstotal.toLocaleString("nb-NO")}
                      </td>
                    </tr>
                  );
                })}

                {/* Sum-rad per type */}
                <tr style={{ borderBottom: "2px solid var(--border)" }}>
                  <td
                    className="px-4 py-2 text-xs font-bold sticky left-0"
                    style={{ background: "var(--background)", color: `var(${cfg.farge})` }}
                  >
                    Sum {cfg.label.toLowerCase()}
                  </td>
                  {Array.from({ length: 12 }, (_, i) => {
                    const sum = sumTypePerMåned(type, i + 1);
                    return (
                      <td key={i} className="px-2 py-2 text-right text-xs font-bold"
                        style={{ background: i + 1 === nåMåned ? "var(--accent-light)" : "var(--background)", color: `var(${cfg.farge})` }}>
                        {sum.toLocaleString("nb-NO")}
                      </td>
                    );
                  })}
                  <td className="px-3 py-2 text-right text-xs font-bold" style={{ background: "var(--background)", color: `var(${cfg.farge})` }}>
                    {Array.from({ length: 12 }, (_, i) => sumTypePerMåned(type, i + 1)).reduce((s, v) => s + v, 0).toLocaleString("nb-NO")}
                  </td>
                </tr>
              </React.Fragment>
            );
          })}

          {/* Balanse-rad */}
          <tr>
            <td
              className="px-4 py-3 font-bold sticky left-0"
              style={{ background: "var(--background)", color: "var(--text-primary)", borderTop: "2px solid var(--border)" }}
            >
              Til overs
            </td>
            {Array.from({ length: 12 }, (_, i) => {
              const balanse = balansePerMåned(i + 1);
              return (
                <td
                  key={i}
                  className="px-2 py-3 text-right font-bold text-sm"
                  style={{
                    background: i + 1 === nåMåned ? "var(--accent-light)" : "var(--background)",
                    color: balanse >= 0 ? "var(--green)" : "var(--red)",
                    borderTop: "2px solid var(--border)",
                  }}
                >
                  {balanse.toLocaleString("nb-NO")}
                </td>
              );
            })}
            <td
              className="px-3 py-3 text-right font-bold text-sm"
              style={{
                background: "var(--background)",
                color: Array.from({ length: 12 }, (_, i) => balansePerMåned(i + 1)).reduce((s, v) => s + v, 0) >= 0 ? "var(--green)" : "var(--red)",
                borderTop: "2px solid var(--border)",
              }}
            >
              {Array.from({ length: 12 }, (_, i) => balansePerMåned(i + 1)).reduce((s, v) => s + v, 0).toLocaleString("nb-NO")}
            </td>
          </tr>
        </tbody>
      </table>

      <p className="mt-3 text-xs" style={{ color: "var(--text-muted)" }}>
        Gult = avviker fra standardbeløpet · Blåt = inneværende måned · Klikk en celle for å redigere, lagres automatisk
      </p>
    </div>
  );
}
