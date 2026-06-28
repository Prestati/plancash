"use client";

import { useState, useMemo } from "react";

interface Gjeld {
  id: string;
  navn: string;
  saldo: number;
  rente: number; // årlig rente i %
  minBetaling: number;
  eier: string;
}

type Strategi = "snøball" | "lavine";

function lagId() {
  return Math.random().toString(36).slice(2);
}

function beregnNedbetalingsplan(
  gjelder: Gjeld[],
  ekstraBetaling: number,
  strategi: Strategi
): { måneder: number; totalRenter: number; rekkefølge: string[] } {
  if (!gjelder.length) return { måneder: 0, totalRenter: 0, rekkefølge: [] };

  let saldoer = gjelder.map(g => ({ ...g, gjeldende: g.saldo }));
  let måned = 0;
  let totalRenter = 0;
  const nedbetalt: string[] = [];

  while (saldoer.some(g => g.gjeldende > 0) && måned < 600) {
    måned++;

    // Legg til renter
    saldoer = saldoer.map(g => {
      if (g.gjeldende <= 0) return g;
      const renter = (g.gjeldende * g.rente) / 100 / 12;
      totalRenter += renter;
      return { ...g, gjeldende: g.gjeldende + renter };
    });

    // Betal minimumsbetaling på alle
    saldoer = saldoer.map(g => {
      if (g.gjeldende <= 0) return g;
      const betaling = Math.min(g.minBetaling, g.gjeldende);
      return { ...g, gjendende: 0, gjeldende: g.gjeldende - betaling };
    });

    // Finn fokusgjeld (snøball = minst saldo, lavine = høyest rente)
    const aktive = saldoer.filter(g => g.gjeldende > 0);
    if (!aktive.length) break;

    const fokus = strategi === "snøball"
      ? aktive.reduce((a, b) => a.gjeldende < b.gjeldende ? a : b)
      : aktive.reduce((a, b) => a.rente > b.rente ? a : b);

    saldoer = saldoer.map(g => {
      if (g.id !== fokus.id || g.gjeldende <= 0) return g;
      return { ...g, gjeldende: Math.max(0, g.gjeldende - ekstraBetaling) };
    });

    // Sjekk hva som er nedbetalt denne måneden
    saldoer.forEach(g => {
      if (g.gjeldende <= 0 && !nedbetalt.includes(g.navn)) {
        nedbetalt.push(g.navn);
      }
    });
  }

  return { måneder: måned, totalRenter: Math.round(totalRenter), rekkefølge: nedbetalt };
}

const TOMGJELD: Omit<Gjeld, "id"> = { navn: "", saldo: 0, rente: 0, minBetaling: 0, eier: "felles" };

export default function GjeldsplanKlient({ userId, voksne }: { userId: string; voksne: string[] }) {
  const [gjelder, setGjelder] = useState<Gjeld[]>([]);
  const [strategi, setStrategi] = useState<Strategi>("snøball");
  const [ekstraBetaling, setEkstraBetaling] = useState(500);
  const [visSkjema, setVisSkjema] = useState(false);
  const [ny, setNy] = useState<Omit<Gjeld, "id">>({ ...TOMGJELD, eier: voksne[0] ?? "felles" });

  const eierValg = voksne.length > 0 ? ["felles", ...voksne] : ["felles"];

  const totalGjeld = gjelder.reduce((s, g) => s + g.saldo, 0);
  const totalMinBetaling = gjelder.reduce((s, g) => s + g.minBetaling, 0);

  const plan = useMemo(() =>
    beregnNedbetalingsplan(gjelder, ekstraBetaling, strategi),
    [gjelder, ekstraBetaling, strategi]
  );

  function leggTil() {
    if (!ny.navn || ny.saldo <= 0) return;
    setGjelder(prev => [...prev, { ...ny, id: lagId() }]);
    setNy({ ...TOMGJELD, eier: voksne[0] ?? "felles" });
    setVisSkjema(false);
  }

  function slett(id: string) {
    setGjelder(prev => prev.filter(g => g.id !== id));
  }

  const månederTekst = (m: number) => {
    if (m >= 600) return "50+ år";
    const år = Math.floor(m / 12);
    const mnd = m % 12;
    if (år === 0) return `${mnd} mnd`;
    if (mnd === 0) return `${år} år`;
    return `${år} år ${mnd} mnd`;
  };

  const inputStyle = {
    background: "var(--background)",
    border: "1px solid var(--border)",
    color: "var(--text-primary)",
    fontSize: "16px",
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-lora)", color: "var(--text-primary)" }}>
            Gjeldsplan
          </h1>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "var(--amber)", color: "white" }}>BETA</span>
        </div>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Legg inn gjelden din og få en plan for hvordan du kommer deg ut av den.
        </p>
      </div>

      {/* Gjeldsliste */}
      {gjelder.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="hidden md:grid px-5 py-3 text-xs font-semibold uppercase tracking-wider"
            style={{ gridTemplateColumns: "1fr 100px 80px 100px 32px", color: "var(--text-muted)", borderBottom: "1px solid var(--border)", background: "var(--background)" }}>
            <span>Navn</span><span className="text-right">Saldo</span><span className="text-right">Rente</span><span className="text-right">Min/mnd</span><span />
          </div>
          {gjelder.map((g, idx) => (
            <div key={g.id}>
              {/* Desktop */}
              <div className="hidden md:grid items-center px-5 py-3.5"
                style={{ gridTemplateColumns: "1fr 100px 80px 100px 32px", borderBottom: idx < gjelder.length - 1 ? "1px solid var(--border)" : "none" }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{g.navn}</p>
                  {g.eier !== "felles" && <p className="text-xs" style={{ color: "var(--text-muted)" }}>{g.eier}</p>}
                </div>
                <p className="text-right text-sm font-semibold" style={{ color: "var(--red)" }}>{g.saldo.toLocaleString("nb-NO")} kr</p>
                <p className="text-right text-sm" style={{ color: "var(--text-secondary)" }}>{g.rente} %</p>
                <p className="text-right text-sm" style={{ color: "var(--text-secondary)" }}>{g.minBetaling.toLocaleString("nb-NO")} kr</p>
                <button onClick={() => slett(g.id)} className="text-lg opacity-30 hover:opacity-70 justify-self-end" style={{ color: "var(--red)" }}>×</button>
              </div>
              {/* Mobil */}
              <div className="md:hidden px-4 py-3 flex items-center justify-between gap-3"
                style={{ borderBottom: idx < gjelder.length - 1 ? "1px solid var(--border)" : "none" }}>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{g.navn}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {g.rente}% rente · min {g.minBetaling.toLocaleString("nb-NO")} kr/mnd
                    {g.eier !== "felles" ? ` · ${g.eier}` : ""}
                  </p>
                </div>
                <p className="text-sm font-bold shrink-0" style={{ color: "var(--red)" }}>{g.saldo.toLocaleString("nb-NO")} kr</p>
                <button onClick={() => slett(g.id)} className="text-lg opacity-30 hover:opacity-70" style={{ color: "var(--red)" }}>×</button>
              </div>
            </div>
          ))}
          <div className="px-5 py-3 flex justify-between text-sm font-semibold"
            style={{ borderTop: "2px solid var(--border)", background: "var(--background)" }}>
            <span style={{ color: "var(--text-primary)" }}>Totalt</span>
            <span style={{ color: "var(--red)" }}>{totalGjeld.toLocaleString("nb-NO")} kr</span>
          </div>
        </div>
      )}

      {/* Legg til gjeld */}
      {visSkjema ? (
        <div className="rounded-2xl p-5 space-y-4" style={{ background: "var(--surface)", border: "1px solid var(--accent)" }}>
          <h3 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>Ny gjeldspost</h3>
          <div className="grid grid-cols-1 gap-3">
            <input type="text" value={ny.navn} onChange={e => setNy(p => ({ ...p, navn: e.target.value }))}
              placeholder="Navn (f.eks. Kredittkort, Forbrukslån)" className="w-full px-3 py-2.5 rounded-xl outline-none" style={inputStyle} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs mb-1 block" style={{ color: "var(--text-muted)" }}>Gjenstående saldo (kr)</label>
                <input type="number" value={ny.saldo || ""} onChange={e => setNy(p => ({ ...p, saldo: Number(e.target.value) }))}
                  placeholder="0" className="w-full px-3 py-2.5 rounded-xl outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: "var(--text-muted)" }}>Årlig rente (%)</label>
                <input type="number" value={ny.rente || ""} onChange={e => setNy(p => ({ ...p, rente: Number(e.target.value) }))}
                  placeholder="0" className="w-full px-3 py-2.5 rounded-xl outline-none" style={inputStyle} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs mb-1 block" style={{ color: "var(--text-muted)" }}>Minimumsbetaling/mnd</label>
                <input type="number" value={ny.minBetaling || ""} onChange={e => setNy(p => ({ ...p, minBetaling: Number(e.target.value) }))}
                  placeholder="0" className="w-full px-3 py-2.5 rounded-xl outline-none" style={inputStyle} />
              </div>
              {eierValg.length > 1 && (
                <div>
                  <label className="text-xs mb-1 block" style={{ color: "var(--text-muted)" }}>Hvem sin gjeld?</label>
                  <select value={ny.eier} onChange={e => setNy(p => ({ ...p, eier: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl outline-none" style={inputStyle}>
                    {eierValg.map(e => <option key={e} value={e}>{e === "felles" ? "Felles" : e}</option>)}
                  </select>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setVisSkjema(false)} className="px-5 py-2.5 rounded-xl text-sm font-medium"
              style={{ background: "var(--background)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
              Avbryt
            </button>
            <button onClick={leggTil} disabled={!ny.navn || ny.saldo <= 0}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40"
              style={{ background: "var(--accent)" }}>
              Legg til →
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setVisSkjema(true)}
          className="w-full py-3.5 rounded-2xl text-sm font-semibold"
          style={{ background: "var(--surface)", color: "var(--accent)", border: "1px dashed var(--accent)" }}>
          + Legg til gjeld
        </button>
      )}

      {/* Plan */}
      {gjelder.length > 0 && (
        <>
          {/* Ekstra betaling */}
          <div className="rounded-2xl p-5 space-y-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <h3 className="font-bold" style={{ fontFamily: "var(--font-lora)", color: "var(--text-primary)" }}>Din nedbetalingsplan</h3>

            <div>
              <label className="text-sm font-medium block mb-2" style={{ color: "var(--text-secondary)" }}>
                Ekstra betaling per måned: <strong style={{ color: "var(--accent)" }}>{ekstraBetaling.toLocaleString("nb-NO")} kr</strong>
              </label>
              <input type="range" min={0} max={20000} step={100} value={ekstraBetaling}
                onChange={e => setEkstraBetaling(Number(e.target.value))}
                className="w-full" style={{ accentColor: "var(--accent)" }} />
              <div className="flex justify-between text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                <span>0 kr</span><span>20 000 kr</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2" style={{ color: "var(--text-secondary)" }}>Strategi</label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { id: "snøball", ikon: "⛄", tittel: "Snøball", beskrivelse: "Betal minste gjeld først — rask seier og motivasjon" },
                  { id: "lavine", ikon: "🏔️", tittel: "Lavine", beskrivelse: "Betal høyeste rente først — spar mest penger totalt" },
                ] as const).map(s => (
                  <button key={s.id} onClick={() => setStrategi(s.id)}
                    className="text-left p-3 rounded-xl transition-all"
                    style={{
                      background: strategi === s.id ? "var(--accent-light)" : "var(--background)",
                      border: `1.5px solid ${strategi === s.id ? "var(--accent)" : "var(--border)"}`,
                    }}>
                    <p className="text-base mb-0.5">{s.ikon}</p>
                    <p className="text-sm font-semibold" style={{ color: strategi === s.id ? "var(--accent)" : "var(--text-primary)" }}>{s.tittel}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{s.beskrivelse}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Resultatkort */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl p-4 text-center" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-lora)", color: "var(--red)" }}>
                {totalGjeld.toLocaleString("nb-NO")}
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>kr total gjeld</p>
            </div>
            <div className="rounded-2xl p-4 text-center" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-lora)", color: "var(--accent)" }}>
                {månederTekst(plan.måneder)}
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>til gjeldfri</p>
            </div>
            <div className="rounded-2xl p-4 text-center" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-lora)", color: "var(--amber)" }}>
                {plan.totalRenter.toLocaleString("nb-NO")}
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>kr i renter</p>
            </div>
          </div>

          {/* Rekkefølge */}
          {plan.rekkefølge.length > 0 && (
            <div className="rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <p className="text-sm font-bold mb-3" style={{ fontFamily: "var(--font-lora)", color: "var(--text-primary)" }}>
                Slik betaler du ned
              </p>
              <div className="space-y-2">
                {plan.rekkefølge.map((navn, i) => (
                  <div key={navn} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                      style={{ background: "var(--accent)" }}>{i + 1}</div>
                    <span className="text-sm" style={{ color: "var(--text-primary)" }}>{navn}</span>
                    {i === 0 && <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "var(--accent-light)", color: "var(--accent)" }}>Fokus nå</span>}
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 flex justify-between text-sm" style={{ borderTop: "1px solid var(--border)" }}>
                <span style={{ color: "var(--text-secondary)" }}>Min. betaling/mnd:</span>
                <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{totalMinBetaling.toLocaleString("nb-NO")} kr</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span style={{ color: "var(--text-secondary)" }}>Med ekstra betaling:</span>
                <span className="font-semibold" style={{ color: "var(--green)" }}>{(totalMinBetaling + ekstraBetaling).toLocaleString("nb-NO")} kr/mnd</span>
              </div>
            </div>
          )}
        </>
      )}

      {gjelder.length === 0 && !visSkjema && (
        <div className="text-center py-12" style={{ color: "var(--text-muted)" }}>
          <p className="text-4xl mb-3">💳</p>
          <p className="text-sm">Legg til gjelden din for å se nedbetalingsplanen din.</p>
        </div>
      )}
    </div>
  );
}
