"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Transaksjon {
  id: string;
  dato: string;
  beløp: number;
  beskrivelse: string | null;
  betalt_av: string | null;
}

export default function ForbrukTransaksjonsListe({
  transaksjoner: initTransaksjoner,
}: {
  transaksjoner: Transaksjon[];
}) {
  const [transaksjoner, setTransaksjoner] = useState(initTransaksjoner);
  const [redigerer, setRedigerer] = useState<string | null>(null);
  const [lagrer, setLagrer] = useState<string | null>(null);

  const total = transaksjoner.reduce((s, t) => s + t.beløp, 0);

  // Per-person statistikk
  const perPerson: Record<string, number> = {};
  for (const t of transaksjoner) {
    const navn = t.betalt_av && t.betalt_av !== "felles" ? t.betalt_av : "Felles";
    perPerson[navn] = (perPerson[navn] ?? 0) + t.beløp;
  }
  const personListe = Object.entries(perPerson).sort((a, b) => b[1] - a[1]);

  async function lagreEndring(t: Transaksjon, felt: "beløp" | "beskrivelse" | "betalt_av", verdi: string) {
    setLagrer(t.id);
    const supabase = createClient();
    const oppdatertVerdi = felt === "beløp" ? Number(verdi) || 0 : verdi;
    const { error } = await supabase.from("transaksjoner").update({ [felt]: oppdatertVerdi }).eq("id", t.id);
    if (!error) {
      setTransaksjoner(prev => prev.map(x => x.id === t.id ? { ...x, [felt]: oppdatertVerdi } : x));
    }
    setLagrer(null);
  }

  async function slett(id: string) {
    const supabase = createClient();
    await supabase.from("transaksjoner").delete().eq("id", id);
    setTransaksjoner(prev => prev.filter(t => t.id !== id));
  }

  return (
    <div>
      {/* Per-person statistikk */}
      {personListe.length > 1 && (
        <div className="rounded-2xl p-5 mb-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <p className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)", fontFamily: "var(--font-lora)" }}>
            Fordeling per person
          </p>
          <div className="space-y-2.5">
            {personListe.map(([navn, beløp]) => (
              <div key={navn}>
                <div className="flex justify-between text-sm mb-1">
                  <span style={{ color: "var(--text-primary)" }}>{navn}</span>
                  <span className="font-semibold" style={{ color: "var(--red)" }}>{beløp.toLocaleString("nb-NO")} kr</span>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                  <div className="h-full rounded-full" style={{
                    width: `${total > 0 ? (beløp / total) * 100 : 0}%`,
                    background: "var(--accent)",
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transaksjonsliste */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div
          className="hidden md:grid px-5 py-3 text-xs font-semibold uppercase tracking-wider"
          style={{
            gridTemplateColumns: "1fr 120px 100px 40px",
            background: "var(--background)",
            color: "var(--text-muted)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div>Beskrivelse</div>
          <div>Hvem</div>
          <div className="text-right">Beløp</div>
          <div></div>
        </div>

        {transaksjoner.length === 0 && (
          <div className="px-5 py-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>
            Ingen registrerte poster
          </div>
        )}

        {transaksjoner.map((t, idx) => (
          <div
            key={t.id}
            className="grid items-center px-5 py-3.5 gap-2"
            style={{
              gridTemplateColumns: "1fr 100px 110px 32px",
              borderBottom: idx < transaksjoner.length - 1 ? "1px solid var(--border)" : "none",
              opacity: lagrer === t.id ? 0.6 : 1,
            }}
          >
            <div>
              {redigerer === t.id ? (
                <input
                  defaultValue={t.beskrivelse ?? ""}
                  onBlur={e => { lagreEndring(t, "beskrivelse", e.target.value); setRedigerer(null); }}
                  autoFocus
                  className="w-full text-sm px-2 py-1 rounded-lg outline-none"
                  style={{ background: "var(--background)", border: "1px solid var(--accent)", color: "var(--text-primary)" }}
                />
              ) : (
                <p
                  className="text-sm font-medium cursor-pointer"
                  style={{ color: "var(--text-primary)" }}
                  onClick={() => setRedigerer(t.id)}
                >
                  {t.beskrivelse || <span style={{ color: "var(--text-muted)" }}>—</span>}
                </p>
              )}
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                {new Date(t.dato).toLocaleDateString("nb-NO", { day: "numeric", month: "long" })}
              </p>
            </div>
            <div>
              <select
                value={t.betalt_av ?? "felles"}
                onChange={e => lagreEndring(t, "betalt_av", e.target.value)}
                className="text-xs px-1.5 py-1 rounded-lg outline-none"
                style={{ background: "var(--accent-light)", color: "var(--accent)", border: "none" }}
              >
                <option value="felles">Felles</option>
                {Array.from(new Set(transaksjoner.map(x => x.betalt_av).filter(b => b && b !== "felles"))).map(navn => (
                  <option key={navn} value={navn!}>{navn}</option>
                ))}
              </select>
            </div>
            <div className="text-right">
              <input
                type="number"
                defaultValue={t.beløp}
                onBlur={e => lagreEndring(t, "beløp", e.target.value)}
                className="w-full text-right font-semibold text-sm px-2 py-1 rounded-lg outline-none"
                style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--red)" }}
              />
            </div>
            <button
              onClick={() => slett(t.id)}
              className="text-xl opacity-30 hover:opacity-70 transition-opacity justify-self-end"
              style={{ color: "var(--red)" }}
            >×</button>
          </div>
        ))}
      </div>
    </div>
  );
}
