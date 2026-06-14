"use client";

import { useState } from "react";
import { beregnSifoPrKategori, type AgeGroup } from "@/lib/sifo";

const MÅNEDER = ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Des"];

const KATEGORIER = [
  { id: "bolig", label: "Bolig & lån", ikon: "🏠" },
  { id: "mat", label: "Mat & dagligvarer", ikon: "🛒" },
  { id: "transport", label: "Transport", ikon: "🚗" },
  { id: "barn", label: "Barn & aktiviteter", ikon: "👶" },
  { id: "klær", label: "Klær & sko", ikon: "👕" },
  { id: "helse", label: "Helse & velvære", ikon: "❤️" },
  { id: "sparing", label: "Sparing", ikon: "💰" },
  { id: "fritid", label: "Fritid & underholdning", ikon: "🎬" },
  { id: "annet", label: "Annet", ikon: "📦" },
];

const STANDARD_HUSHOLDNING: AgeGroup[] = ["voksen_31_50", "voksen_31_50", "barn_6_9", "barn_10_13"];

type BudsjettPost = { budsjett: number; faktisk: number };
type MånedsBudsjett = Record<string, BudsjettPost>;

function lagTomBudsjett(sifoRef: Record<string, number>): MånedsBudsjett {
  return {
    bolig: { budsjett: 15000, faktisk: 0 },
    mat: { budsjett: sifoRef.mat_drikke ?? 8000, faktisk: 0 },
    transport: { budsjett: sifoRef.transport ?? 4000, faktisk: 0 },
    barn: { budsjett: (sifoRef.barnehage_sfo ?? 0) + 2000, faktisk: 0 },
    klær: { budsjett: sifoRef.klær_sko ?? 1500, faktisk: 0 },
    helse: { budsjett: sifoRef.helse ?? 500, faktisk: 0 },
    sparing: { budsjett: 5000, faktisk: 0 },
    fritid: { budsjett: sifoRef.lek_medier ?? 1500, faktisk: 0 },
    annet: { budsjett: 2000, faktisk: 0 },
  };
}

function getSifoForKategori(katId: string, sifoRef: Record<string, number>): number {
  const mapping: Record<string, string[]> = {
    mat: ["mat_drikke", "andre_dagligvarer"],
    transport: ["transport"],
    barn: ["barnehage_sfo"],
    klær: ["klær_sko"],
    helse: ["helse"],
    fritid: ["lek_medier"],
    annet: ["personlig_pleie"],
  };
  return (mapping[katId] ?? []).reduce((sum, k) => sum + (sifoRef[k] ?? 0), 0);
}

export default function BudsjettOversikt({ userId: _userId }: { userId: string }) {
  const now = new Date();
  const [aktivMåned, setAktivMåned] = useState(now.getMonth());
  const [visning, setVisning] = useState<"måned" | "år">("måned");
  const [visSifo, setVisSifo] = useState(true);

  const sifoRef = beregnSifoPrKategori(STANDARD_HUSHOLDNING);
  const [budsjett, setBudsjett] = useState<MånedsBudsjett>(lagTomBudsjett(sifoRef));

  const totalBudsjett = Object.values(budsjett).reduce((s, p) => s + p.budsjett, 0);
  const totalFaktisk = Object.values(budsjett).reduce((s, p) => s + p.faktisk, 0);
  const sifoTotal = Object.values(sifoRef).reduce((a, b) => a + b, 0);

  function oppdaterPost(id: string, felt: "budsjett" | "faktisk", verdi: number) {
    setBudsjett((prev) => ({ ...prev, [id]: { ...prev[id], [felt]: verdi } }));
  }

  return (
    <div>
      {/* Kontroller */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div
          className="flex rounded-xl p-1"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          {(["måned", "år"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setVisning(v)}
              className="px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all"
              style={{
                background: visning === v ? "var(--accent)" : "transparent",
                color: visning === v ? "white" : "var(--text-secondary)",
              }}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>

        {visning === "måned" && (
          <div className="flex flex-wrap gap-1">
            {MÅNEDER.map((m, i) => (
              <button
                key={m}
                onClick={() => setAktivMåned(i)}
                className="px-3 py-1.5 rounded-lg text-sm transition-all"
                style={{
                  background: aktivMåned === i ? "var(--accent)" : "var(--surface)",
                  color: aktivMåned === i ? "white" : "var(--text-secondary)",
                  border: `1px solid ${aktivMåned === i ? "var(--accent)" : "var(--border)"}`,
                  fontWeight: aktivMåned === i ? 600 : 400,
                }}
              >
                {m}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => setVisSifo(!visSifo)}
          className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm transition-all"
          style={{
            background: visSifo ? "var(--accent-light)" : "var(--surface)",
            color: visSifo ? "var(--accent)" : "var(--text-secondary)",
            border: `1px solid ${visSifo ? "var(--accent)" : "var(--border)"}`,
            fontWeight: visSifo ? 600 : 400,
          }}
        >
          SIFO-referanse
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: visSifo ? "var(--accent)" : "var(--border)" }}
          />
        </button>
      </div>

      {/* Sammendrag */}
      <div className={`grid gap-4 mb-6 ${visSifo ? "grid-cols-3" : "grid-cols-2"}`}>
        <SummaryCard label="Budsjettert" value={totalBudsjett} colorVar="--text-primary" />
        <SummaryCard
          label="Faktisk brukt"
          value={totalFaktisk}
          colorVar={totalFaktisk > totalBudsjett ? "--red" : "--green"}
          sublabel={totalFaktisk > totalBudsjett ? `${(totalFaktisk - totalBudsjett).toLocaleString("nb-NO")} kr over budsjett` : totalFaktisk > 0 ? `${(totalBudsjett - totalFaktisk).toLocaleString("nb-NO")} kr igjen` : undefined}
        />
        {visSifo && (
          <SummaryCard label="SIFO referanse" value={sifoTotal} colorVar="--accent" sublabel="For din husholdning" />
        )}
      </div>

      {/* Tabell */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        {/* Header */}
        <div
          className="grid px-6 py-3 text-xs font-semibold uppercase tracking-wider"
          style={{
            gridTemplateColumns: visSifo ? "2fr 1fr 1fr 1fr 80px" : "2fr 1fr 1fr 80px",
            background: "var(--background)",
            color: "var(--text-muted)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div>Kategori</div>
          <div className="text-right">Budsjett</div>
          <div className="text-right">Faktisk</div>
          {visSifo && <div className="text-right">SIFO ref.</div>}
          <div className="text-right">+/−</div>
        </div>

        {KATEGORIER.map((kat, idx) => {
          const post = budsjett[kat.id];
          const diff = post.faktisk - post.budsjett;
          const pct = post.budsjett > 0 ? Math.min((post.faktisk / post.budsjett) * 100, 100) : 0;
          const sifoVal = getSifoForKategori(kat.id, sifoRef);
          const isLast = idx === KATEGORIER.length - 1;

          return (
            <div
              key={kat.id}
              style={{ borderBottom: isLast ? "none" : "1px solid var(--border)" }}
            >
              <div
                className="grid items-center px-6 py-3.5"
                style={{ gridTemplateColumns: visSifo ? "2fr 1fr 1fr 1fr 80px" : "2fr 1fr 1fr 80px" }}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{kat.ikon}</span>
                  <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    {kat.label}
                  </span>
                </div>

                <div className="flex justify-end">
                  <input
                    type="number"
                    value={post.budsjett || ""}
                    onChange={(e) => oppdaterPost(kat.id, "budsjett", Number(e.target.value))}
                    className="w-28 text-right text-sm px-3 py-1.5 rounded-lg outline-none transition-all"
                    style={{
                      background: "var(--background)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>

                <div className="flex justify-end">
                  <input
                    type="number"
                    value={post.faktisk || ""}
                    onChange={(e) => oppdaterPost(kat.id, "faktisk", Number(e.target.value))}
                    className="w-28 text-right text-sm px-3 py-1.5 rounded-lg outline-none transition-all"
                    style={{
                      background: "var(--background)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>

                {visSifo && (
                  <div className="text-right text-sm" style={{ color: "var(--accent)" }}>
                    {sifoVal > 0 ? `${sifoVal.toLocaleString("nb-NO")} kr` : "—"}
                  </div>
                )}

                <div className="text-right">
                  {post.faktisk > 0 && (
                    <span
                      className="text-xs font-semibold"
                      style={{ color: diff > 0 ? "var(--red)" : "var(--green)" }}
                    >
                      {diff > 0 ? "+" : ""}{diff.toLocaleString("nb-NO")}
                    </span>
                  )}
                </div>
              </div>

              {post.faktisk > 0 && (
                <div className="px-6 pb-3">
                  <div
                    className="h-1 rounded-full overflow-hidden"
                    style={{ background: "var(--border)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        background: pct > 100 ? "var(--red)" : pct > 80 ? "var(--amber)" : "var(--green)",
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Totalrad */}
        <div
          className="grid items-center px-6 py-4"
          style={{
            gridTemplateColumns: visSifo ? "2fr 1fr 1fr 1fr 80px" : "2fr 1fr 1fr 80px",
            borderTop: `2px solid var(--border)`,
            background: "var(--background)",
          }}
        >
          <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Totalt</div>
          <div className="text-right text-sm font-bold" style={{ color: "var(--text-primary)" }}>
            {totalBudsjett.toLocaleString("nb-NO")} kr
          </div>
          <div
            className="text-right text-sm font-bold"
            style={{ color: totalFaktisk > totalBudsjett ? "var(--red)" : "var(--green)" }}
          >
            {totalFaktisk.toLocaleString("nb-NO")} kr
          </div>
          {visSifo && (
            <div className="text-right text-sm font-bold" style={{ color: "var(--accent)" }}>
              {sifoTotal.toLocaleString("nb-NO")} kr
            </div>
          )}
          <div />
        </div>
      </div>

      {visSifo && (
        <p className="mt-3 text-xs" style={{ color: "var(--text-muted)" }}>
          * SIFO-referansebudsjett 2024 (OsloMet/SIFO) for 2 voksne (31–50 år) og 2 barn (6–9 og 10–13 år). Bolig og sparing er ikke inkludert i SIFO-tallene.
        </p>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  colorVar,
  sublabel,
}: {
  label: string;
  value: number;
  colorVar: string;
  sublabel?: string;
}) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <p className="text-sm mb-1" style={{ color: "var(--text-muted)" }}>{label}</p>
      <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-lora)", color: `var(${colorVar})` }}>
        {value.toLocaleString("nb-NO")} kr
      </p>
      {sublabel && <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{sublabel}</p>}
    </div>
  );
}
