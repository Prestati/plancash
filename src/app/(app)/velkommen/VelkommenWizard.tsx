"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const ALDERSGRUPPER = [
  { verdi: "voksen_m", label: "Voksen (mann)" },
  { verdi: "voksen_k", label: "Voksen (kvinne)" },
  { verdi: "barn_0_2", label: "Barn 0–2 år" },
  { verdi: "barn_3_5", label: "Barn 3–5 år" },
  { verdi: "barn_6_9", label: "Barn 6–9 år" },
  { verdi: "barn_10_13", label: "Barn 10–13 år" },
  { verdi: "barn_14_17", label: "Barn 14–17 år" },
];

const FORSLAG_INNTEKT = ["Lønn", "Barnetrygd", "Bostøtte", "Bonus"];
const FORSLAG_FAST = [
  { navn: "Boliglån", ikon: "🏠" },
  { navn: "Strøm", ikon: "⚡" },
  { navn: "Internett", ikon: "📡" },
  { navn: "Forsikring", ikon: "🛡️" },
  { navn: "Barnehage / SFO", ikon: "🏫" },
  { navn: "Treningssenter", ikon: "💪" },
  { navn: "Bilabonnement", ikon: "🚗" },
];
const FORSLAG_FORBRUK = [
  { navn: "Dagligvarer", ikon: "🛒" },
  { navn: "Klær & sko", ikon: "👗" },
  { navn: "Utemat", ikon: "🍕" },
  { navn: "Transport", ikon: "🚌" },
  { navn: "Helse", ikon: "💊" },
  { navn: "Godterier & Snacks", ikon: "🍫" },
  { navn: "Lek & fritid", ikon: "🎮" },
  { navn: "Alkohol", ikon: "🍷" },
  { navn: "Ferie", ikon: "✈️" },
  { navn: "Andre utgifter", ikon: "📦" },
];

interface Medlem {
  navn: string;
  aldersgruppe: string;
  kjønn: string;
}

interface InntektPost {
  navn: string;
  beløp: string;
  eier: string;
}

interface FastPost {
  navn: string;
  ikon: string;
  beløp: string;
  valgt: boolean;
}

interface ForbrukPost {
  navn: string;
  ikon: string;
  beløp: string;
  valgt: boolean;
}

export default function VelkommenWizard({ userId }: { userId: string }) {
  const router = useRouter();
  const [steg, setSteg] = useState(0);
  const [lagrer, setLagrer] = useState(false);

  // Steg 1: Hushold
  const [medlemmer, setMedlemmer] = useState<Medlem[]>([
    { navn: "", aldersgruppe: "voksen_k", kjønn: "k" },
  ]);

  // Steg 2: Inntekt
  const [inntekter, setInntekter] = useState<InntektPost[]>([
    { navn: "Lønn", beløp: "", eier: "" },
  ]);

  // Steg 3: Faste
  const [faste, setFaste] = useState<FastPost[]>(
    FORSLAG_FAST.map(f => ({ ...f, beløp: "", valgt: false }))
  );

  // Steg 4: Forbruk
  const [forbruk, setForbruk] = useState<ForbrukPost[]>(
    FORSLAG_FORBRUK.map(f => ({ ...f, beløp: "", valgt: false }))
  );

  const voksneNavn = medlemmer.filter(m => m.aldersgruppe.startsWith("voksen") && m.navn).map(m => m.navn);

  async function fullfør() {
    setLagrer(true);
    const supabase = createClient();

    // Lagre hushold
    const gyldigeMedlemmer = medlemmer.filter(m => m.navn.trim());
    if (gyldigeMedlemmer.length > 0) {
      await supabase.from("husholdning_profil").upsert({
        user_id: userId,
        medlemmer: gyldigeMedlemmer,
      });
    }

    // Bygg kategorier
    const kategorier: {
      user_id: string; navn: string; type: string;
      standard_beløp: number; ikon: string; eier: string; sortering: number; aktiv: boolean;
    }[] = [];
    let sortering = 0;

    for (const inn of inntekter) {
      if (inn.beløp && Number(inn.beløp) > 0) {
        kategorier.push({
          user_id: userId,
          navn: inn.navn || "Inntekt",
          type: "inntekt",
          standard_beløp: Number(inn.beløp),
          ikon: "💰",
          eier: inn.eier || "felles",
          sortering: sortering++,
          aktiv: true,
        });
      }
    }

    for (const f of faste) {
      if (f.valgt && f.beløp && Number(f.beløp) > 0) {
        kategorier.push({
          user_id: userId,
          navn: f.navn,
          type: "fast",
          standard_beløp: Number(f.beløp),
          ikon: f.ikon,
          eier: "felles",
          sortering: sortering++,
          aktiv: true,
        });
      }
    }

    for (const f of forbruk) {
      if (f.valgt) {
        kategorier.push({
          user_id: userId,
          navn: f.navn,
          type: "forbruk",
          standard_beløp: Number(f.beløp) || 0,
          ikon: f.ikon,
          eier: "felles",
          sortering: sortering++,
          aktiv: true,
        });
      }
    }

    if (kategorier.length > 0) {
      await supabase.from("budsjett_kategorier").insert(kategorier);
    }

    router.push("/dashboard");
  }

  const inputStyle = {
    background: "var(--background)",
    border: "1px solid var(--border)",
    color: "var(--text-primary)",
    fontSize: "16px",
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-5 py-8 max-w-lg mx-auto">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-lg" style={{ background: "var(--accent)" }}>₪</div>
        <span className="text-2xl font-bold" style={{ fontFamily: "var(--font-lora)", color: "var(--text-primary)" }}>Plancash</span>
      </div>

      {/* Fremdrift */}
      <div className="w-full flex gap-1.5 mb-8">
        {[0, 1, 2, 3].map(s => (
          <div key={s} className="flex-1 h-1.5 rounded-full transition-all" style={{
            background: s <= steg ? "var(--accent)" : "var(--border)"
          }} />
        ))}
      </div>

      {/* Steg 0: Velkommen */}
      {steg === 0 && (
        <div className="w-full space-y-6">
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: "var(--accent)" }}>Steg 1 av 4</p>
            <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-lora)", color: "var(--text-primary)" }}>
              Hvem er dere i husholdet?
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Legg til alle som bor hos deg — vi bruker det til å beregne budsjettforslag.
            </p>
          </div>

          <div className="space-y-3">
            {medlemmer.map((m, i) => (
              <div key={i} className="rounded-2xl p-4 space-y-3" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={m.navn}
                    onChange={e => setMedlemmer(prev => prev.map((x, j) => j === i ? { ...x, navn: e.target.value } : x))}
                    placeholder={i === 0 ? "Ditt navn" : "Navn"}
                    className="flex-1 px-3 py-2.5 rounded-xl outline-none"
                    style={inputStyle}
                  />
                  {medlemmer.length > 1 && (
                    <button onClick={() => setMedlemmer(prev => prev.filter((_, j) => j !== i))}
                      className="text-lg opacity-40 hover:opacity-70" style={{ color: "var(--red)" }}>×</button>
                  )}
                </div>
                <select
                  value={m.aldersgruppe}
                  onChange={e => {
                    const ag = e.target.value;
                    const kjønn = ag.includes("_k") ? "k" : ag.includes("_m") ? "m" : "k";
                    setMedlemmer(prev => prev.map((x, j) => j === i ? { ...x, aldersgruppe: ag, kjønn } : x));
                  }}
                  className="w-full px-3 py-2.5 rounded-xl outline-none"
                  style={inputStyle}
                >
                  {ALDERSGRUPPER.map(ag => <option key={ag.verdi} value={ag.verdi}>{ag.label}</option>)}
                </select>
              </div>
            ))}
          </div>

          <button
            onClick={() => setMedlemmer(prev => [...prev, { navn: "", aldersgruppe: "barn_6_9", kjønn: "k" }])}
            className="w-full py-3 rounded-2xl text-sm font-medium"
            style={{ background: "var(--surface)", color: "var(--accent)", border: "1px dashed var(--accent)" }}
          >
            + Legg til person
          </button>

          <button
            onClick={() => setSteg(1)}
            disabled={!medlemmer.some(m => m.navn.trim())}
            className="w-full py-4 rounded-2xl font-semibold text-white disabled:opacity-40"
            style={{ background: "var(--accent)" }}
          >
            Neste →
          </button>
        </div>
      )}

      {/* Steg 1: Inntekt */}
      {steg === 1 && (
        <div className="w-full space-y-6">
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: "var(--accent)" }}>Steg 2 av 4</p>
            <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-lora)", color: "var(--text-primary)" }}>
              Hva er inntektene?
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Legg inn månedlig inntekt etter skatt.
            </p>
          </div>

          <div className="space-y-3">
            {inntekter.map((inn, i) => (
              <div key={i} className="rounded-2xl p-4 space-y-3" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inn.navn}
                    onChange={e => setInntekter(prev => prev.map((x, j) => j === i ? { ...x, navn: e.target.value } : x))}
                    placeholder="f.eks. Lønn"
                    className="flex-1 px-3 py-2.5 rounded-xl outline-none"
                    style={inputStyle}
                    list="inntekt-forslag"
                  />
                  {inntekter.length > 1 && (
                    <button onClick={() => setInntekter(prev => prev.filter((_, j) => j !== i))}
                      className="text-lg opacity-40 hover:opacity-70" style={{ color: "var(--red)" }}>×</button>
                  )}
                </div>
                <datalist id="inntekt-forslag">
                  {FORSLAG_INNTEKT.map(f => <option key={f} value={f} />)}
                </datalist>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={inn.beløp}
                    onChange={e => setInntekter(prev => prev.map((x, j) => j === i ? { ...x, beløp: e.target.value } : x))}
                    placeholder="Beløp kr"
                    className="px-3 py-2.5 rounded-xl outline-none"
                    style={inputStyle}
                  />
                  {voksneNavn.length > 1 ? (
                    <select
                      value={inn.eier}
                      onChange={e => setInntekter(prev => prev.map((x, j) => j === i ? { ...x, eier: e.target.value } : x))}
                      className="px-3 py-2.5 rounded-xl outline-none"
                      style={inputStyle}
                    >
                      <option value="">Hvem?</option>
                      {voksneNavn.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  ) : (
                    <div className="px-3 py-2.5 rounded-xl text-sm" style={{ background: "var(--background)", color: "var(--text-muted)" }}>
                      {voksneNavn[0] || "Deg"}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setInntekter(prev => [...prev, { navn: "", beløp: "", eier: "" }])}
            className="w-full py-3 rounded-2xl text-sm font-medium"
            style={{ background: "var(--surface)", color: "var(--accent)", border: "1px dashed var(--accent)" }}
          >
            + Legg til inntekt
          </button>

          <div className="flex gap-3">
            <button onClick={() => setSteg(0)} className="py-4 px-6 rounded-2xl font-semibold" style={{ background: "var(--surface)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>←</button>
            <button
              onClick={() => setSteg(2)}
              className="flex-1 py-4 rounded-2xl font-semibold text-white"
              style={{ background: "var(--accent)" }}
            >
              Neste →
            </button>
          </div>
        </div>
      )}

      {/* Steg 2: Faste utgifter */}
      {steg === 2 && (
        <div className="w-full space-y-6">
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: "var(--accent)" }}>Steg 3 av 4</p>
            <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-lora)", color: "var(--text-primary)" }}>
              Faste utgifter
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Kryss av det som gjelder deg og legg inn månedlig beløp.
            </p>
          </div>

          <div className="space-y-2">
            {faste.map((f, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all"
                style={{ background: f.valgt ? "var(--accent-light)" : "var(--surface)", border: `1px solid ${f.valgt ? "var(--accent)" : "var(--border)"}` }}>
                <button
                  onClick={() => setFaste(prev => prev.map((x, j) => j === i ? { ...x, valgt: !x.valgt } : x))}
                  className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold transition-all"
                  style={{
                    background: f.valgt ? "var(--accent)" : "transparent",
                    border: `2px solid ${f.valgt ? "var(--accent)" : "var(--border)"}`,
                    color: "white",
                  }}
                >{f.valgt ? "✓" : ""}</button>
                <span className="text-base">{f.ikon}</span>
                <span className="flex-1 text-sm font-medium" style={{ color: "var(--text-primary)" }}>{f.navn}</span>
                {f.valgt && (
                  <input
                    type="number"
                    value={f.beløp}
                    onChange={e => setFaste(prev => prev.map((x, j) => j === i ? { ...x, beløp: e.target.value } : x))}
                    placeholder="kr/mnd"
                    className="w-24 text-right px-2 py-1.5 rounded-lg outline-none"
                    style={inputStyle}
                    autoFocus
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setSteg(1)} className="py-4 px-6 rounded-2xl font-semibold" style={{ background: "var(--surface)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>←</button>
            <button
              onClick={() => setSteg(3)}
              className="flex-1 py-4 rounded-2xl font-semibold text-white"
              style={{ background: "var(--accent)" }}
            >
              Neste →
            </button>
          </div>
        </div>
      )}

      {/* Steg 3: Forbrukskategorier */}
      {steg === 3 && (
        <div className="w-full space-y-6">
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: "var(--accent)" }}>Steg 4 av 4</p>
            <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-lora)", color: "var(--text-primary)" }}>
              Forbrukskategorier
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Velg kategoriene du vil spore. Du kan legge til budsjett per kategori nå eller senere.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {forbruk.map((f, i) => (
              <button
                key={i}
                onClick={() => setForbruk(prev => prev.map((x, j) => j === i ? { ...x, valgt: !x.valgt } : x))}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl text-left transition-all"
                style={{
                  background: f.valgt ? "var(--accent-light)" : "var(--surface)",
                  border: `1px solid ${f.valgt ? "var(--accent)" : "var(--border)"}`,
                }}
              >
                <span className="text-lg">{f.ikon}</span>
                <span className="text-sm font-medium leading-tight" style={{ color: f.valgt ? "var(--accent)" : "var(--text-primary)" }}>{f.navn}</span>
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setSteg(2)} className="py-4 px-6 rounded-2xl font-semibold" style={{ background: "var(--surface)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>←</button>
            <button
              onClick={fullfør}
              disabled={lagrer || !forbruk.some(f => f.valgt)}
              className="flex-1 py-4 rounded-2xl font-semibold text-white disabled:opacity-40"
              style={{ background: "var(--accent)" }}
            >
              {lagrer ? "Setter opp budsjettet..." : "Kom i gang! 🎉"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
