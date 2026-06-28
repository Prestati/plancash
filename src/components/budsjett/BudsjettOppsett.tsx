"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TYPE_CONFIG, type BudsjettKategori, type BudsjettType } from "@/lib/budsjett";
import { beregnSifoPrKategori, SIFO_KATEGORIER } from "@/lib/sifo";
import type { HusholdMedlem } from "@/lib/types";

const TYPE_REKKEFØLGE: BudsjettType[] = ["inntekt", "fast", "gjeld", "abonnement", "forbruk", "sparing"];

const SIFO_HINT: Partial<Record<string, string>> = {
  mat_drikke: "forbruk", klær_sko: "forbruk", personlig_pleie: "forbruk",
  lek_medier: "forbruk", transport: "fast", helse: "forbruk", barnehage_sfo: "fast",
};

function EierBadge({ eier, onClick }: { eier: string; onClick?: () => void }) {
  const erFelles = eier === "felles";
  return (
    <button
      onClick={onClick}
      className="text-xs px-2 py-0.5 rounded-full font-medium transition-colors"
      style={{
        background: erFelles ? "var(--border)" : "var(--accent-light)",
        color: erFelles ? "var(--text-muted)" : "var(--accent)",
      }}
    >
      {erFelles ? "Felles" : eier}
    </button>
  );
}

export default function BudsjettOppsett({
  userId,
  eksisterendeKategorier,
  husholdMedlemmer,
}: {
  userId: string;
  eksisterendeKategorier: BudsjettKategori[];
  husholdMedlemmer: HusholdMedlem[];
}) {
  const router = useRouter();
  const [kategorier, setKategorier] = useState<BudsjettKategori[]>(eksisterendeKategorier);
  const [aktivType, setAktivType] = useState<BudsjettType>("inntekt");
  const [lagrer, setLagrer] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);
  const [lagrerKategori, setLagrerKategori] = useState<string | null>(null);
  const [nyttNavn, setNyttNavn] = useState("");
  const [nyttBeløp, setNyttBeløp] = useState("");
  const [nyttEier, setNyttEier] = useState("felles");
  const [nyttKonto, setNyttKonto] = useState("");
  const navnRef = useRef<HTMLInputElement>(null);

  // Alle mulige eiere: felles + husholdsmedlemmer
  const eierValg = ["felles", ...husholdMedlemmer.map((m) => m.navn)];

  const sifoRef = husholdMedlemmer.length > 0
    ? beregnSifoPrKategori(husholdMedlemmer.map((m) => ({ aldersgruppe: m.aldersgruppe, kjønn: m.kjønn })))
    : null;

  const kategorierForType = kategorier.filter((k) => k.type === aktivType && k.aktiv);

  async function lagreKategoriTilDB(kategori: BudsjettKategori) {
    setLagrerKategori(kategori.id);
    const supabase = createClient();
    const { error } = await supabase.from("budsjett_kategorier").upsert({
      id: kategori.id,
      user_id: userId,
      navn: kategori.navn,
      type: kategori.type,
      "standard_beløp": kategori.standard_beløp,
      ikon: kategori.ikon,
      eier: kategori.eier ?? "felles",
      konto: kategori.konto ?? null,
      sortering: kategori.sortering,
      aktiv: true,
    });
    setLagrerKategori(null);
    if (error) setFeil(error.message);
  }

  async function leggTil() {
    if (!nyttNavn.trim()) return;
    const nyKategori: BudsjettKategori = {
      id: crypto.randomUUID(),
      user_id: userId,
      navn: nyttNavn.trim(),
      type: aktivType,
      standard_beløp: Number(nyttBeløp) || 0,
      ikon: TYPE_CONFIG[aktivType].ikon,
      eier: nyttEier,
      konto: nyttKonto.trim() || null,
      sortering: kategorierForType.length,
      aktiv: true,
    };
    setKategorier([...kategorier, nyKategori]);
    setNyttNavn("");
    setNyttBeløp("");
    setNyttKonto("");
    navnRef.current?.focus();
    await lagreKategoriTilDB(nyKategori);
  }

  function oppdaterBeløp(id: string, verdi: string) {
    setKategorier(kategorier.map((k) =>
      k.id === id ? { ...k, standard_beløp: Number(verdi) || 0 } : k
    ));
  }

  async function lagreBeløpPåBlur(id: string) {
    const k = kategorier.find((k) => k.id === id);
    if (k) await lagreKategoriTilDB(k);
  }

  async function syklusEier(id: string) {
    const oppdatert = kategorier.map((k) => {
      if (k.id !== id) return k;
      const idx = eierValg.indexOf(k.eier);
      const neste = eierValg[(idx + 1) % eierValg.length];
      return { ...k, eier: neste };
    });
    setKategorier(oppdatert);
    const k = oppdatert.find((k) => k.id === id);
    if (k) await lagreKategoriTilDB(k);
  }

  async function slett(id: string) {
    setKategorier(kategorier.map((k) => k.id === id ? { ...k, aktiv: false } : k));
    const supabase = createClient();
    await supabase.from("budsjett_kategorier").delete().eq("id", id);
  }

  function lagre() {
    router.push("/plancash");
    router.refresh();
  }

  const totalInntekt = kategorier.filter(k => k.type === "inntekt" && k.aktiv).reduce((s, k) => s + k.standard_beløp, 0);
  const totalUtgifter = kategorier.filter(k => k.type !== "inntekt" && k.aktiv).reduce((s, k) => s + k.standard_beløp, 0);
  const rest = totalInntekt - totalUtgifter;

  // Per-person-oppsummering
  const personSummary = eierValg.map((eier) => {
    const inntekt = kategorier.filter(k => k.aktiv && k.type === "inntekt" && k.eier === eier).reduce((s, k) => s + k.standard_beløp, 0);
    const utgift = kategorier.filter(k => k.aktiv && k.type !== "inntekt" && k.eier === eier).reduce((s, k) => s + k.standard_beløp, 0);
    return { eier, inntekt, utgift };
  }).filter(p => p.inntekt > 0 || p.utgift > 0);

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Venstre: oppsett */}
      <div className="flex-1 min-w-0">
        {/* Type-tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {TYPE_REKKEFØLGE.map((type) => {
            const cfg = TYPE_CONFIG[type];
            const antall = kategorier.filter(k => k.type === type && k.aktiv).length;
            return (
              <button
                key={type}
                onClick={() => setAktivType(type)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: aktivType === type ? `var(${cfg.farge})` : "var(--surface)",
                  color: aktivType === type ? "white" : "var(--text-secondary)",
                  border: `1px solid ${aktivType === type ? `var(${cfg.farge})` : "var(--border)"}`,
                }}
              >
                <span>{cfg.ikon}</span>
                <span>{cfg.label}</span>
                {antall > 0 && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full"
                    style={{
                      background: aktivType === type ? "rgba(255,255,255,0.25)" : "var(--border)",
                      color: aktivType === type ? "white" : "var(--text-muted)",
                    }}
                  >
                    {antall}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Kategori-liste */}
        <div className="rounded-2xl overflow-hidden mb-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div
            className="grid px-5 py-3 text-xs font-semibold uppercase tracking-wider"
            style={{
              gridTemplateColumns: "1fr 120px 160px 36px",
              background: "var(--background)",
              color: "var(--text-muted)",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div>{TYPE_CONFIG[aktivType].label}</div>
            <div>Tilhører</div>
            <div className="text-right">Mnd. beløp (kr)</div>
            <div />
          </div>

          {kategorierForType.length === 0 && (
            <div className="px-5 py-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>
              Ingen poster ennå — legg til under
            </div>
          )}

          {kategorierForType.map((k, idx) => (
            <div
              key={k.id}
              className="grid items-center px-5 py-3"
              style={{
                gridTemplateColumns: "1fr 120px 160px 36px",
                borderBottom: idx < kategorierForType.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <input
                  type="text"
                  defaultValue={k.navn}
                  key={k.id + "-navn"}
                  onBlur={async (e) => {
                    const nyttNavn = e.target.value.trim();
                    if (!nyttNavn || nyttNavn === k.navn) return;
                    const supabase = createClient();
                    await supabase.from("budsjett_kategorier").update({ navn: nyttNavn }).eq("id", k.id);
                    setKategorier(prev => prev.map(x => x.id === k.id ? { ...x, navn: nyttNavn } : x));
                  }}
                  className="text-sm font-medium outline-none bg-transparent border-b border-transparent hover:border-dashed focus:border-solid truncate"
                  style={{ color: "var(--text-primary)", borderColor: "transparent", maxWidth: "160px" }}
                  onFocus={e => (e.target.style.borderColor = "var(--accent)")}
                  onBlurCapture={e => (e.currentTarget.style.borderColor = "transparent")}
                />
                {k.konto && (
                  <span className="text-xs px-2 py-0.5 rounded-full shrink-0" style={{ background: "var(--border)", color: "var(--text-muted)" }}>
                    {k.konto}
                  </span>
                )}
              </div>
              <div>
                <EierBadge eier={k.eier ?? "felles"} onClick={() => syklusEier(k.id)} />
              </div>
              <div className="flex justify-end">
                <div className="flex items-center gap-1.5">
                  {lagrerKategori === k.id && <span className="text-xs" style={{ color: "var(--text-muted)" }}>lagrer...</span>}
                  <input
                    type="number"
                    defaultValue={k.standard_beløp || ""}
                    key={k.id}
                    onChange={(e) => oppdaterBeløp(k.id, e.target.value)}
                    onBlur={(e) => {
                      e.target.style.borderColor = "var(--border)";
                      lagreBeløpPåBlur(k.id);
                    }}
                    className="w-36 text-right text-sm px-3 py-1.5 rounded-lg outline-none"
                    style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                  />
                </div>
              </div>
              <button onClick={() => slett(k.id)} className="text-center text-lg leading-none opacity-30 hover:opacity-100 transition-opacity" style={{ color: "var(--red)" }}>×</button>
            </div>
          ))}

          {kategorierForType.length > 0 && (
            <div
              className="grid items-center px-5 py-3"
              style={{ gridTemplateColumns: "1fr 120px 160px 36px", borderTop: "2px solid var(--border)", background: "var(--background)" }}
            >
              <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Totalt</span>
              <div />
              <div className="text-right text-sm font-bold" style={{ color: `var(${TYPE_CONFIG[aktivType].farge})` }}>
                {kategorierForType.reduce((s, k) => s + k.standard_beløp, 0).toLocaleString("nb-NO")} kr
              </div>
              <div />
            </div>
          )}
        </div>

        {/* Legg til ny */}
        <div className="rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <p className="text-sm font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>
            + Legg til i {TYPE_CONFIG[aktivType].label.toLowerCase()}
          </p>
          <div className="flex gap-3 mb-3">
            <input
              ref={navnRef}
              type="text"
              value={nyttNavn}
              onChange={(e) => setNyttNavn(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && leggTil()}
              placeholder={aktivType === "inntekt" ? "f.eks. Lønn" : aktivType === "fast" ? "f.eks. Strøm" : aktivType === "gjeld" ? "f.eks. Boliglån" : aktivType === "abonnement" ? "f.eks. Netflix" : aktivType === "forbruk" ? "f.eks. Dagligvare" : "f.eks. Buffer"}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: "var(--background)", border: "1.5px solid var(--border)", color: "var(--text-primary)" }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
            <input
              type="number"
              value={nyttBeløp}
              onChange={(e) => setNyttBeløp(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && leggTil()}
              placeholder="kr/mnd"
              className="w-28 px-4 py-2.5 rounded-xl text-sm outline-none text-right"
              style={{ background: "var(--background)", border: "1.5px solid var(--border)", color: "var(--text-primary)" }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>

          {/* Eier-valg */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Tilhører:</span>
            <div className="flex gap-1.5 flex-wrap">
              {eierValg.map((eier) => (
                <button
                  key={eier}
                  onClick={() => setNyttEier(eier)}
                  className="text-xs px-3 py-1 rounded-full font-medium transition-all"
                  style={{
                    background: nyttEier === eier ? "var(--accent)" : "var(--background)",
                    color: nyttEier === eier ? "white" : "var(--text-secondary)",
                    border: `1px solid ${nyttEier === eier ? "var(--accent)" : "var(--border)"}`,
                  }}
                >
                  {eier === "felles" ? "🏠 Felles" : eier}
                </button>
              ))}
            </div>
          </div>

          {/* Konto-tag */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Konto:</span>
            <input
              type="text"
              value={nyttKonto}
              onChange={(e) => setNyttKonto(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && leggTil()}
              placeholder="f.eks. DNB brukskonto"
              className="flex-1 px-3 py-1.5 rounded-lg text-xs outline-none"
              style={{ background: "var(--background)", border: "1.5px solid var(--border)", color: "var(--text-primary)" }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>

          <button
            onClick={leggTil}
            disabled={!nyttNavn.trim()}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-40"
            style={{ background: "var(--accent)" }}
          >
            Legg til
          </button>
        </div>

        {feil && (
          <div className="mt-4 p-4 rounded-xl text-sm" style={{ background: "var(--red-light)", color: "var(--red)", border: "1px solid var(--red)" }}>
            Feil ved lagring: {feil}
          </div>
        )}

        <button
          onClick={lagre}
          disabled={kategorier.filter(k => k.aktiv).length === 0}
          className="mt-6 w-full py-3 rounded-xl font-semibold text-white transition-opacity disabled:opacity-40"
          style={{ background: "var(--accent)" }}
        >
          Gå til budsjett →
        </button>
      </div>

      {/* Høyre: sammendrag + SIFO */}
      <div className="w-full md:w-72 md:shrink-0 space-y-4">
        {/* Månedlig sammendrag */}
        <div className="rounded-2xl p-5 md:sticky md:top-8" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <h3 className="font-bold text-sm mb-4" style={{ fontFamily: "var(--font-lora)", color: "var(--text-primary)" }}>
            Månedlig oversikt
          </h3>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span style={{ color: "var(--text-secondary)" }}>Inntekter</span>
              <span className="font-semibold" style={{ color: "var(--green)" }}>{totalInntekt.toLocaleString("nb-NO")} kr</span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: "var(--text-secondary)" }}>Utgifter</span>
              <span className="font-semibold" style={{ color: "var(--red)" }}>{totalUtgifter.toLocaleString("nb-NO")} kr</span>
            </div>
            <div className="flex justify-between text-sm pt-2 mt-2" style={{ borderTop: "1px solid var(--border)" }}>
              <span className="font-bold" style={{ color: "var(--text-primary)" }}>Til overs</span>
              <span className="font-bold" style={{ color: rest >= 0 ? "var(--green)" : "var(--red)" }}>
                {rest.toLocaleString("nb-NO")} kr
              </span>
            </div>
          </div>

          {/* Per person */}
          {personSummary.length > 0 && (
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "12px", marginTop: "4px" }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Per person</p>
              {personSummary.map(({ eier, inntekt, utgift }) => (
                <div key={eier} className="mb-3">
                  <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
                    {eier === "felles" ? "🏠 Felles" : eier}
                  </p>
                  {inntekt > 0 && (
                    <div className="flex justify-between text-xs">
                      <span style={{ color: "var(--text-muted)" }}>Inntekt</span>
                      <span style={{ color: "var(--green)" }}>+{inntekt.toLocaleString("nb-NO")} kr</span>
                    </div>
                  )}
                  {utgift > 0 && (
                    <div className="flex justify-between text-xs">
                      <span style={{ color: "var(--text-muted)" }}>Utgifter</span>
                      <span style={{ color: "var(--red)" }}>−{utgift.toLocaleString("nb-NO")} kr</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SIFO */}
        {sifoRef && (
          <div className="rounded-2xl p-5" style={{ background: "var(--accent-light)", border: "1px solid var(--accent)" }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm" style={{ color: "var(--accent)" }}>SIFO-referanse</h3>
              <span className="text-xs" style={{ color: "var(--accent)" }}>for din familie</span>
            </div>
            <div className="space-y-1.5">
              {(Object.entries(SIFO_KATEGORIER) as [string, string][]).map(([key, label]) => {
                const val = sifoRef[key] ?? 0;
                if (val === 0) return null;
                const erAktivType = SIFO_HINT[key] === aktivType;
                return (
                  <div key={key} className="flex justify-between text-xs rounded-lg px-2 py-1"
                    style={{ background: erAktivType ? "rgba(61,99,115,0.12)" : "transparent", fontWeight: erAktivType ? 600 : 400 }}>
                    <span style={{ color: "var(--accent)" }}>{label}</span>
                    <span style={{ color: "var(--accent)" }}>{val.toLocaleString("nb-NO")} kr</span>
                  </div>
                );
              })}
            </div>
            <p className="text-xs mt-3" style={{ color: "var(--accent)", opacity: 0.7 }}>
              Relevante poster for valgt kategori er uthevet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
