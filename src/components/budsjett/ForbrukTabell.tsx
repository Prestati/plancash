"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BudsjettKategori } from "@/lib/budsjett";

const MND_KORT = ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Des"];

interface Transaksjon {
  id: string;
  kategori: string | null;
  dato: string;
  beløp: number;
  betalt_av: string | null;
  kilde: string | null;
  beskrivelse: string | null;
}

export default function ForbrukTabell({
  kategorier,
  transaksjoner,
  år,
}: {
  kategorier: BudsjettKategori[];
  transaksjoner: Transaksjon[];
  år: number;
}) {
  const router = useRouter();
  const nåMåned = new Date().getMonth() + 1;
  const [valgtMåned, setValgtMåned] = useState(nåMåned);
  const forbrukKategorier = kategorier.filter(k => k.type === "forbruk" && k.aktiv);
  const pengerInnTrans = transaksjoner.filter(t => t.kilde === "inn");

  // Grupper penger inn per avsender (beskrivelse eller betalt_av)
  const pengerInnPerPerson = pengerInnTrans.reduce<Record<string, { total: number; transaksjoner: Transaksjon[] }>>((acc, t) => {
    const navn = t.beskrivelse || t.betalt_av || "Ukjent";
    if (!acc[navn]) acc[navn] = { total: 0, transaksjoner: [] };
    acc[navn].total += t.beløp;
    acc[navn].transaksjoner.push(t);
    return acc;
  }, {});

  const pengerInnSortertPerPerson = Object.entries(pengerInnPerPerson)
    .sort((a, b) => b[1].total - a[1].total);

  const totalPengerInn = pengerInnTrans.reduce((s, t) => s + t.beløp, 0);

  function sumForCell(kategoriId: string, maned: number): number {
    return transaksjoner
      .filter(t => t.kategori === kategoriId && new Date(t.dato).getMonth() + 1 === maned)
      .reduce((s, t) => s + t.beløp, 0);
  }

  function sumPerMåned(maned: number): number {
    return forbrukKategorier.reduce((s, k) => s + sumForCell(k.id, maned), 0);
  }

  function sumPerKategori(kategoriId: string): number {
    return Array.from({ length: 12 }, (_, i) => sumForCell(kategoriId, i + 1)).reduce((s, v) => s + v, 0);
  }

  const årstotal = Array.from({ length: 12 }, (_, i) => sumPerMåned(i + 1)).reduce((s, v) => s + v, 0);

  return (
    <div>
    {/* Mobilvisning — kortliste med månedsblaing */}
    <div className="md:hidden mb-4">
      {/* Månedsvelger */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setValgtMåned(m => m > 1 ? m - 1 : 12)}
          className="w-9 h-9 rounded-full flex items-center justify-center text-base"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
        >←</button>
        <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
          {MND_KORT[valgtMåned - 1]} {år}
          {valgtMåned === nåMåned && <span className="ml-2 text-xs font-normal" style={{ color: "var(--accent)" }}>• nå</span>}
        </p>
        <button
          onClick={() => setValgtMåned(m => m < 12 ? m + 1 : 1)}
          className="w-9 h-9 rounded-full flex items-center justify-center text-base"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
        >→</button>
      </div>

      <div className="space-y-2">
        {forbrukKategorier.map(k => {
          const sum = sumForCell(k.id, valgtMåned);
          const budsjett = k.standard_beløp;
          const overBudsjett = budsjett > 0 && sum > budsjett;
          return (
            <div
              key={k.id}
              onClick={() => sum > 0 && router.push(`/forbruk/${k.id}/${år}/${valgtMåned}`)}
              className="px-4 py-3 rounded-xl"
              style={{
                background: sum > 0 ? "var(--red-light)" : "var(--surface)",
                border: `1px solid ${overBudsjett ? "var(--red)" : sum > 0 ? "var(--red)" : "var(--border)"}`,
                cursor: sum > 0 ? "pointer" : "default",
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium" style={{ color: sum > 0 ? "var(--red)" : "var(--text-primary)" }}>
                    {k.navn}
                  </span>
                  {k.eier && k.eier !== "felles" && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
                      {k.eier}
                    </span>
                  )}
                </div>
                <span className="text-sm font-semibold" style={{ color: sum > 0 ? "var(--red)" : "var(--text-muted)" }}>
                  {sum > 0 ? `${Math.round(sum).toLocaleString("nb-NO")} kr →` : "0"}
                </span>
              </div>
              {budsjett > 0 && sum > 0 && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1" style={{ color: "var(--text-muted)" }}>
                    <span>{Math.round((sum / budsjett) * 100)}% av {budsjett.toLocaleString("nb-NO")} kr budsjett</span>
                    {overBudsjett && <span style={{ color: "var(--red)", fontWeight: 600 }}>+{Math.round(sum - budsjett).toLocaleString("nb-NO")} kr over</span>}
                  </div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                    <div className="h-full rounded-full" style={{
                      width: `${Math.min((sum / budsjett) * 100, 100)}%`,
                      background: overBudsjett ? "var(--red)" : "var(--green)",
                    }} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {sumPerMåned(valgtMåned) > 0 && (
          <div className="flex items-center justify-between px-4 py-3 rounded-xl font-bold"
            style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
            <span className="text-sm" style={{ color: "var(--text-primary)" }}>Totalt</span>
            <span className="text-sm" style={{ color: "var(--red)" }}>{Math.round(sumPerMåned(valgtMåned)).toLocaleString("nb-NO")} kr</span>
          </div>
        )}
      </div>
    </div>

    {/* Desktop — full tabell */}
    <div className="hidden md:block overflow-auto" style={{ maxHeight: "75vh" }}>
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
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {forbrukKategorier.map((k) => (
            <tr key={k.id} style={{ borderBottom: "1px solid var(--border)" }}>
              <td
                className="px-4 py-2 sticky left-0 z-10 font-medium text-sm"
                style={{ background: "var(--surface)", color: "var(--text-primary)" }}
              >
                <div className="flex items-center gap-2">
                  <span className="truncate">{k.navn}</span>
                  {k.eier && k.eier !== "felles" && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
                      {k.eier}
                    </span>
                  )}
                </div>
              </td>
              {Array.from({ length: 12 }, (_, i) => {
                const maned = i + 1;
                const sum = sumForCell(k.id, maned);
                const harData = sum > 0;
                const erNå = maned === nåMåned;
                return (
                  <td
                    key={maned}
                    className="px-2 py-2 text-right text-sm"
                    style={{
                      background: harData ? "var(--red-light)" : erNå ? "var(--accent-light)" : "var(--surface)",
                      color: harData ? "var(--red)" : "var(--text-muted)",
                      fontWeight: harData ? 600 : 400,
                      cursor: harData ? "pointer" : "default",
                    }}
                    onClick={() => harData && router.push(`/forbruk/${k.id}/${år}/${maned}`)}
                    title={harData ? "Klikk for å se detaljer" : undefined}
                  >
                    {harData ? (
                      <span className="underline decoration-dotted underline-offset-2">
                        {sum.toLocaleString("nb-NO")}
                      </span>
                    ) : (
                      <span className="opacity-30">0</span>
                    )}
                  </td>
                );
              })}
              <td
                className="px-3 py-2 text-right font-semibold text-sm"
                style={{
                  background: "var(--background)",
                  color: sumPerKategori(k.id) > 0 ? "var(--red)" : "var(--text-muted)",
                }}
              >
                {sumPerKategori(k.id) > 0 ? sumPerKategori(k.id).toLocaleString("nb-NO") : "—"}
              </td>
            </tr>
          ))}

          <tr>
            <td
              className="px-4 py-3 font-bold sticky left-0"
              style={{ background: "var(--background)", color: "var(--text-primary)", borderTop: "2px solid var(--border)" }}
            >
              TOTALT
            </td>
            {Array.from({ length: 12 }, (_, i) => {
              const sum = sumPerMåned(i + 1);
              return (
                <td
                  key={i}
                  className="px-2 py-3 text-right font-bold text-sm"
                  style={{
                    background: i + 1 === nåMåned ? "var(--accent-light)" : "var(--background)",
                    color: sum > 0 ? "var(--red)" : "var(--text-muted)",
                    borderTop: "2px solid var(--border)",
                  }}
                >
                  {sum > 0 ? sum.toLocaleString("nb-NO") : "—"}
                </td>
              );
            })}
            <td
              className="px-3 py-3 text-right font-bold text-sm"
              style={{
                background: "var(--background)",
                color: årstotal > 0 ? "var(--red)" : "var(--text-muted)",
                borderTop: "2px solid var(--border)",
              }}
            >
              {årstotal > 0 ? årstotal.toLocaleString("nb-NO") : "—"}
            </td>
          </tr>
        </tbody>
      </table>
      <p className="mt-3 px-1 text-xs" style={{ color: "var(--text-muted)" }}>
        Rødt = registrert forbruk · Blått = inneværende måned · Klikk et beløp for å se detaljene
      </p>
    </div>

    {/* Penger inn-seksjon */}
    {pengerInnTrans.length > 0 && (
      <div className="mt-4 mx-0">
        <div className="px-4 py-3 flex items-center justify-between"
          style={{ background: "var(--green-light)", borderTop: "2px solid var(--green)" }}>
          <span className="text-sm font-semibold" style={{ color: "var(--green)" }}>💚 Penger inn</span>
          <span className="text-sm font-bold" style={{ color: "var(--green)" }}>
            +{totalPengerInn.toLocaleString("nb-NO")} kr totalt
          </span>
        </div>
        <div className="divide-y" style={{ borderTop: "1px solid var(--border)" }}>
          {pengerInnSortertPerPerson.map(([navn, data], idx) => (
            <div key={idx} className="flex items-center justify-between px-4 py-3"
              style={{ background: idx % 2 === 0 ? "var(--surface)" : "var(--green-light)" }}>
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{navn}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {data.transaksjoner.length} {data.transaksjoner.length === 1 ? "innbetaling" : "innbetalinger"}
                </p>
              </div>
              <span className="text-sm font-semibold" style={{ color: "var(--green)" }}>
                +{data.total.toLocaleString("nb-NO")} kr
              </span>
            </div>
          ))}
        </div>
      </div>
    )}
    </div>
  );
}
