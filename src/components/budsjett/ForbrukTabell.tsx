"use client";

import { useRouter } from "next/navigation";
import type { BudsjettKategori } from "@/lib/budsjett";

const MND_KORT = ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Des"];

interface Transaksjon {
  id: string;
  kategori: string | null;
  dato: string;
  beløp: number;
  betalt_av: string | null;
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
  const forbrukKategorier = kategorier.filter(k => k.type === "forbruk" && k.aktiv);

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

  const nåMåned2 = nåMåned;

  return (
    <div>
    {/* Mobilvisning — kortliste for inneværende måned */}
    <div className="md:hidden space-y-2 mb-4">
      <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
        {MND_KORT[nåMåned2 - 1]} — inneværende måned
      </p>
      {forbrukKategorier.map(k => {
        const sum = sumForCell(k.id, nåMåned2);
        return (
          <div
            key={k.id}
            onClick={() => sum > 0 && router.push(`/forbruk/${k.id}/${år}/${nåMåned2}`)}
            className="flex items-center justify-between px-4 py-3 rounded-xl"
            style={{
              background: sum > 0 ? "var(--red-light)" : "var(--surface)",
              border: `1px solid ${sum > 0 ? "var(--red)" : "var(--border)"}`,
              cursor: sum > 0 ? "pointer" : "default",
            }}
          >
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
              {sum > 0 ? `${sum.toLocaleString("nb-NO")} kr →` : "0"}
            </span>
          </div>
        );
      })}
      {sumPerMåned(nåMåned2) > 0 && (
        <div className="flex items-center justify-between px-4 py-3 rounded-xl font-bold"
          style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
          <span className="text-sm" style={{ color: "var(--text-primary)" }}>Totalt</span>
          <span className="text-sm" style={{ color: "var(--red)" }}>{sumPerMåned(nåMåned2).toLocaleString("nb-NO")} kr</span>
        </div>
      )}
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
    </div>
  );
}
