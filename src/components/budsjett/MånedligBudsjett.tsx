"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  TYPE_CONFIG, MÅNEDER, beløpForMåned, sumForType,
  type BudsjettKategori, type BudsjettMåned, type BudsjettType,
} from "@/lib/budsjett";

const TYPE_REKKEFØLGE: BudsjettType[] = ["inntekt", "fast", "gjeld", "abonnement", "forbruk", "sparing"];

export default function MånedligBudsjett({
  userId,
  kategorier,
  eksisterendeAvvik,
  år,
  låstMåned,
  skjulHeader,
}: {
  userId: string;
  kategorier: BudsjettKategori[];
  eksisterendeAvvik: BudsjettMåned[];
  år: number;
  låstMåned?: number;
  skjulHeader?: boolean;
}) {
  const now = new Date();
  const [aktivMåned, setAktivMåned] = useState(låstMåned ?? now.getMonth());
  const [avvik, setAvvik] = useState<BudsjettMåned[]>(eksisterendeAvvik);
  const [lagrer, setLagrer] = useState<string | null>(null);

  useEffect(() => {
    if (låstMåned !== undefined) {
      setTimeout(() => setAktivMåned(låstMåned), 0);
    }
  }, [låstMåned]);

  const månedAvvik = avvik.filter((a) => a.maned === aktivMåned + 1);
  const harAvvik = (kategoriId: string) => månedAvvik.some((a) => a.kategori_id === kategoriId);

  async function oppdaterBeløp(kategori: BudsjettKategori, verdi: string) {
    const beløp = Number(verdi) || 0;
    const eksisterende = månedAvvik.find((a) => a.kategori_id === kategori.id);
    setLagrer(kategori.id);
    const supabase = createClient();

    if (beløp === kategori.standard_beløp) {
      if (eksisterende) {
        await supabase.from("budsjett_maneder").delete().eq("id", eksisterende.id);
        setAvvik(avvik.filter((a) => a.id !== eksisterende.id));
      }
    } else {
      const { data } = await supabase
        .from("budsjett_maneder")
        .upsert({
          ...(eksisterende ? { id: eksisterende.id } : {}),
          user_id: userId,
          kategori_id: kategori.id,
          ar: år,
          maned: aktivMåned + 1,
          belop: beløp,
        })
        .select()
        .single();

      if (data) {
        setAvvik([...avvik.filter((a) => a.id !== eksisterende?.id), data as BudsjettMåned]);
      }
    }
    setLagrer(null);
  }

  const totalInntekt = sumForType(kategorier, "inntekt", månedAvvik);
  const totalUtgifter = TYPE_REKKEFØLGE
    .filter((t) => t !== "inntekt")
    .reduce((sum, t) => sum + sumForType(kategorier, t, månedAvvik), 0);
  const rest = totalInntekt - totalUtgifter;

  return (
    <div>
      {/* Månedsvelger — skjules hvis styrt utenfra */}
      {!skjulHeader && (
        <div className="flex flex-wrap gap-1.5 mb-6">
          {MÅNEDER.map((m, i) => {
            const harAvvikDenneMåned = avvik.some((a) => a.maned === i + 1);
            return (
              <button
                key={m}
                onClick={() => setAktivMåned(i)}
                className="relative px-3 py-2 rounded-xl text-sm transition-all"
                style={{
                  background: aktivMåned === i ? "var(--accent)" : "var(--surface)",
                  color: aktivMåned === i ? "white" : "var(--text-secondary)",
                  border: `1px solid ${aktivMåned === i ? "var(--accent)" : "var(--border)"}`,
                  fontWeight: aktivMåned === i ? 600 : 400,
                }}
              >
                {m.slice(0, 3)}
                {harAvvikDenneMåned && aktivMåned !== i && (
                  <span
                    className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
                    style={{ background: "var(--amber)" }}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Sammendrag — skjules hvis styrt utenfra (vises i dashbord i stedet) */}
      {!skjulHeader && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <SummaryCard label="Inntekter" value={totalInntekt} colorVar="--green" />
          <SummaryCard label="Utgifter" value={totalUtgifter} colorVar="--red" />
          <SummaryCard
            label="Til overs"
            value={rest}
            colorVar={rest >= 0 ? "--green" : "--red"}
            sublabel={rest < 0 ? "Underskudd!" : rest === 0 ? "Akkurat i balanse" : "Bra jobbet!"}
          />
        </div>
      )}

      {/* Kategori-seksjoner */}
      <div className="space-y-4">
        {TYPE_REKKEFØLGE.map((type) => {
          const kats = kategorier.filter((k) => k.type === type);
          if (kats.length === 0) return null;
          const sum = sumForType(kategorier, type, månedAvvik);
          const cfg = TYPE_CONFIG[type];

          return (
            <div key={type} className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between px-5 py-3" style={{ background: "var(--background)", borderBottom: "1px solid var(--border)" }}>
                <span className="text-sm font-semibold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                  <span>{cfg.ikon}</span>{cfg.label}
                </span>
                <span className="text-sm font-bold" style={{ color: `var(${cfg.farge})` }}>
                  {sum.toLocaleString("nb-NO")} kr
                </span>
              </div>

              {kats.map((k, idx) => {
                const erJustert = harAvvik(k.id);
                const verdi = beløpForMåned(k, månedAvvik);
                return (
                  <div
                    key={k.id}
                    className="flex items-center gap-4 px-5 py-3"
                    style={{
                      borderBottom: idx < kats.length - 1 ? "1px solid var(--border)" : "none",
                      background: erJustert ? "var(--amber-light)" : "transparent",
                    }}
                  >
                    <div className="flex-1">
                      <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{k.navn}</span>
                      {k.eier && k.eier !== "felles" && (
                        <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full" style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
                          {k.eier}
                        </span>
                      )}
                      {erJustert && (
                        <span className="ml-2 text-xs" style={{ color: "var(--amber)" }}>
                          Standard: {k.standard_beløp.toLocaleString("nb-NO")} kr
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {lagrer === k.id && <span className="text-xs" style={{ color: "var(--text-muted)" }}>lagrer...</span>}
                      <input
                        type="number"
                        defaultValue={verdi || ""}
                        key={`${k.id}-${aktivMåned}`}
                        onBlur={(e) => {
                          const ny = Number(e.target.value) || 0;
                          if (ny !== verdi) oppdaterBeløp(k, e.target.value);
                        }}
                        className="w-36 text-right text-sm px-3 py-1.5 rounded-lg outline-none"
                        style={{
                          background: erJustert ? "white" : "var(--background)",
                          border: `1px solid ${erJustert ? "var(--amber)" : "var(--border)"}`,
                          color: "var(--text-primary)",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs" style={{ color: "var(--text-muted)" }}>
        🟡 Gult = avviker fra standardbeløpet. Endringer lagres automatisk.
      </p>
    </div>
  );
}

function SummaryCard({ label, value, colorVar, sublabel }: {
  label: string; value: number; colorVar: string; sublabel?: string;
}) {
  return (
    <div className="rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <p className="text-sm mb-1" style={{ color: "var(--text-muted)" }}>{label}</p>
      <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-lora)", color: `var(${colorVar})` }}>
        {value.toLocaleString("nb-NO")} kr
      </p>
      {sublabel && <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{sublabel}</p>}
    </div>
  );
}
