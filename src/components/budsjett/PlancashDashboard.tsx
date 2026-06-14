"use client";

import { useState } from "react";
import {
  TYPE_CONFIG, MÅNEDER, sumForType,
  type BudsjettKategori, type BudsjettMåned, type BudsjettType,
} from "@/lib/budsjett";
import ÅrsbudsjettTabell from "./ÅrsbudsjettTabell";

const TYPE_REKKEFØLGE: BudsjettType[] = ["inntekt", "fast", "gjeld", "abonnement", "forbruk", "sparing"];
const MND_KORT = ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Des"];

export default function PlancashDashboard({
  userId,
  kategorier,
  avvik,
  år,
}: {
  userId: string;
  kategorier: BudsjettKategori[];
  avvik: BudsjettMåned[];
  år: number;
}) {
  const nå = new Date();
  const nåMåned = nå.getMonth();
  const [visning, setVisning] = useState<"tabell" | "søyler">("tabell");

  // Regn ut balanse per måned
  const månedData = Array.from({ length: 12 }, (_, i) => {
    const månedAvvik = avvik.filter((a) => a.maned === i + 1);
    const inntekt = sumForType(kategorier, "inntekt", månedAvvik);
    const utgifter = TYPE_REKKEFØLGE
      .filter((t) => t !== "inntekt")
      .reduce((sum, t) => sum + sumForType(kategorier, t, månedAvvik), 0);
    return { inntekt, utgifter, balanse: inntekt - utgifter };
  });

  const denneMåneden = månedData[nåMåned];
  const årsInntekt = månedData.reduce((s, m) => s + m.inntekt, 0);
  const årsUtgifter = månedData.reduce((s, m) => s + m.utgifter, 0);
  const årsBalanse = årsInntekt - årsUtgifter;

  return (
    <div className="space-y-6">

      {/* Toppkort */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <SummaryCard label={`${MÅNEDER[nåMåned]} — inntekt`} value={denneMåneden.inntekt} colorVar="--green" />
        <SummaryCard label={`${MÅNEDER[nåMåned]} — utgifter`} value={denneMåneden.utgifter} colorVar="--red" />
        <SummaryCard
          label={`${MÅNEDER[nåMåned]} — til overs`}
          value={denneMåneden.balanse}
          colorVar={denneMåneden.balanse >= 0 ? "--green" : "--red"}
        />
        <SummaryCard
          label={`${år} — årsbalanse`}
          value={årsBalanse}
          colorVar={årsBalanse >= 0 ? "--green" : "--red"}
          sublabel={`${årsInntekt.toLocaleString("nb-NO")} − ${årsUtgifter.toLocaleString("nb-NO")}`}
        />
      </div>

      {/* Hurtigoversikt — balanse per måned */}
      <div className="rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold" style={{ fontFamily: "var(--font-lora)", color: "var(--text-primary)" }}>
            Balanse per måned
          </h2>
          <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
            {(["tabell", "søyler"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setVisning(v)}
                className="px-3 py-1.5 text-xs font-medium capitalize"
                style={{
                  background: visning === v ? "var(--accent)" : "transparent",
                  color: visning === v ? "white" : "var(--text-muted)",
                }}
              >
                {v === "tabell" ? "📊 Tabell" : "📈 Søyler"}
              </button>
            ))}
          </div>
        </div>

        {visning === "søyler" ? (
          <MånedSøyler månedData={månedData} nåMåned={nåMåned} />
        ) : (
          <MånedTabell månedData={månedData} nåMåned={nåMåned} />
        )}
      </div>

      {/* Årsbudsjett-tabell */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)", background: "var(--background)" }}>
          <h2 className="text-sm font-bold" style={{ fontFamily: "var(--font-lora)", color: "var(--text-primary)" }}>
            Årsbudsjett {år}
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            Klikk en celle for å justere enkeltmåneder — lagres automatisk
          </p>
        </div>
        <ÅrsbudsjettTabell
          userId={userId}
          kategorier={kategorier}
          eksisterendeAvvik={avvik}
          år={år}
        />
      </div>
    </div>
  );
}

function MånedTabell({ månedData, nåMåned }: {
  månedData: { inntekt: number; utgifter: number; balanse: number }[];
  nåMåned: number;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs" style={{ minWidth: "700px" }}>
        <thead>
          <tr>
            <td className="py-1 font-semibold" style={{ color: "var(--text-muted)", width: "80px" }} />
            {["Jan","Feb","Mar","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Des"].map((m, i) => (
              <td key={m} className="py-1 text-right font-semibold"
                style={{ color: i === nåMåned ? "var(--accent)" : "var(--text-muted)", fontWeight: i === nåMåned ? 700 : 500 }}>
                {m}
              </td>
            ))}
          </tr>
        </thead>
        <tbody>
          {(["Inntekt", "Utgifter", "Til overs"] as const).map((rad) => (
            <tr key={rad}>
              <td className="py-1.5 font-medium text-xs" style={{ color: "var(--text-secondary)" }}>{rad}</td>
              {månedData.map((m, i) => {
                const verdi = rad === "Inntekt" ? m.inntekt : rad === "Utgifter" ? m.utgifter : m.balanse;
                const farge = rad === "Til overs" ? (verdi >= 0 ? "var(--green)" : "var(--red)") : rad === "Inntekt" ? "var(--green)" : "var(--red)";
                return (
                  <td key={i} className="py-1.5 text-right font-medium"
                    style={{ color: farge, fontWeight: i === nåMåned ? 700 : 400 }}>
                    {verdi.toLocaleString("nb-NO")}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MånedSøyler({ månedData, nåMåned }: {
  månedData: { inntekt: number; utgifter: number; balanse: number }[];
  nåMåned: number;
}) {
  const maxVerdi = Math.max(...månedData.map((m) => Math.max(m.inntekt, m.utgifter)), 1);
  return (
    <div className="flex items-end gap-1.5 h-28">
      {månedData.map((m, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full flex items-end gap-0.5 h-20">
            <div className="flex-1 rounded-t-sm" style={{ height: `${(m.inntekt / maxVerdi) * 100}%`, background: i === nåMåned ? "var(--green)" : "var(--green-light)", border: "1px solid var(--green-light)" }} />
            <div className="flex-1 rounded-t-sm" style={{ height: `${(m.utgifter / maxVerdi) * 100}%`, background: i === nåMåned ? "var(--red)" : "var(--red-light)", border: "1px solid var(--red-light)" }} />
          </div>
          <span className="text-xs" style={{ color: i === nåMåned ? "var(--accent)" : "var(--text-muted)", fontWeight: i === nåMåned ? 700 : 400 }}>
            {["J","F","M","A","M","J","J","A","S","O","N","D"][i]}
          </span>
        </div>
      ))}
    </div>
  );
}

function SummaryCard({ label, value, colorVar, sublabel }: {
  label: string; value: number; colorVar: string; sublabel?: string;
}) {
  return (
    <div className="rounded-2xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>{label}</p>
      <p className="text-xl font-bold" style={{ fontFamily: "var(--font-lora)", color: `var(${colorVar})` }}>
        {value.toLocaleString("nb-NO")} kr
      </p>
      {sublabel && <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{sublabel}</p>}
    </div>
  );
}
