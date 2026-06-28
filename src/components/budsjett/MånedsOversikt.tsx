"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MÅNEDER, type BudsjettKategori, type BudsjettMåned } from "@/lib/budsjett";
import RegistrerForbruk from "./RegistrerForbruk";
import AiInnsikt from "./AiInnsikt";

const FASTE_TYPER = ["fast", "gjeld", "abonnement"] as const;

interface Transaksjon {
  id: string;
  dato: string;
  beløp: number;
  beskrivelse: string | null;
  betalt_av: string | null;
  kategori: string | null;
  kilde: string | null;
}

export default function MånedsOversikt({
  userId,
  brukernavn,
  kategorier,
  avvik: initAvvik,
  transaksjoner: initTransaksjoner,
  år,
}: {
  userId: string;
  brukernavn: string;
  kategorier: BudsjettKategori[];
  avvik: BudsjettMåned[];
  transaksjoner: Transaksjon[];
  år: number;
}) {
  const nå = new Date();
  const maned = nå.getMonth() + 1;
  const [avvik, setAvvik] = useState(initAvvik);
  const [transaksjoner, setTransaksjoner] = useState(initTransaksjoner);
  const [lagrer, setLagrer] = useState<string | null>(null);
  const [visFaste, setVisFaste] = useState(false);
  const [visBetalte, setVisBetalte] = useState(false);
  const [visTransaksjoner, setVisTransaksjoner] = useState(false);

  const fasteKategorier = kategorier.filter(k =>
    FASTE_TYPER.includes(k.type as typeof FASTE_TYPER[number]) && k.aktiv
  );
  const månedAvvik = avvik.filter(a => a.maned === maned);

  function beløpForPost(k: BudsjettKategori): number {
    return månedAvvik.find(a => a.kategori_id === k.id)?.belop ?? k.standard_beløp;
  }
  function erBetalt(k: BudsjettKategori): boolean {
    return månedAvvik.some(a => a.kategori_id === k.id);
  }

  async function toggleBetalt(k: BudsjettKategori) {
    const eksisterende = månedAvvik.find(a => a.kategori_id === k.id);
    setLagrer(k.id);
    const supabase = createClient();
    if (eksisterende) {
      await supabase.from("budsjett_maneder").delete().eq("id", eksisterende.id);
      setAvvik(prev => prev.filter(a => a.id !== eksisterende.id));
    } else {
      const { data } = await supabase.from("budsjett_maneder")
        .upsert({ user_id: userId, kategori_id: k.id, ar: år, maned, belop: k.standard_beløp })
        .select().single();
      if (data) setAvvik(prev => [...prev, data as BudsjettMåned]);
    }
    setLagrer(null);
  }

  async function oppdaterBeløp(k: BudsjettKategori, verdi: string) {
    const beløp = Number(verdi) || 0;
    const eksisterende = månedAvvik.find(a => a.kategori_id === k.id);
    setLagrer(k.id);
    const supabase = createClient();
    const { data } = await supabase.from("budsjett_maneder")
      .upsert({ ...(eksisterende ? { id: eksisterende.id } : {}), user_id: userId, kategori_id: k.id, ar: år, maned, belop: beløp })
      .select().single();
    if (data) setAvvik(prev => [...prev.filter(a => a.id !== eksisterende?.id), data as BudsjettMåned]);
    setLagrer(null);
  }

  async function slettTransaksjon(id: string) {
    const supabase = createClient();
    await supabase.from("transaksjoner").delete().eq("id", id);
    setTransaksjoner(prev => prev.filter(t => t.id !== id));
  }

  async function oppdaterTransaksjoner() {
    const supabase = createClient();
    const manadStr = String(maned).padStart(2, "0");
    const nesteManed = maned === 12 ? `${år + 1}-01-01` : `${år}-${String(maned + 1).padStart(2, "0")}-01`;
    const { data } = await supabase
      .from("transaksjoner").select("*").eq("user_id", userId)
      .gte("dato", `${år}-${manadStr}-01`).lt("dato", nesteManed)
      .order("dato", { ascending: false });
    if (data) setTransaksjoner(data as Transaksjon[]);
  }

  function kategoriNavn(id: string | null) {
    return kategorier.find(k => k.id === id)?.navn ?? "—";
  }

  const antallBetalt = fasteKategorier.filter(k => erBetalt(k)).length;
  const gjenstår = fasteKategorier.length - antallBetalt;
  const totalTransaksjoner = transaksjoner.reduce((s, t) => s + t.beløp, 0);
  const inntektKategorier = kategorier.filter(k => k.type === "inntekt" && k.aktiv);
  const ubekreftedInntekt = inntektKategorier.filter(k => !erBetalt(k));
  const totalInntekt = inntektKategorier.reduce((s, k) => {
    const override = månedAvvik.find(a => a.kategori_id === k.id);
    return s + (override ? override.belop : k.standard_beløp);
  }, 0);
  const totalFaste = fasteKategorier.reduce((s, k) => s + beløpForPost(k), 0);
  const tilOvers = totalInntekt - totalFaste - totalTransaksjoner;

  const sparingKategorier = kategorier.filter(k => k.type === "sparing" && k.aktiv);
  const totalSparing = sparingKategorier.reduce((s, k) => {
    const override = månedAvvik.find(a => a.kategori_id === k.id);
    return s + (override ? override.belop : k.standard_beløp);
  }, 0);
  const totalBetalteFaste = fasteKategorier.filter(k => erBetalt(k)).reduce((s, k) => s + beløpForPost(k), 0);
  const totalBrukt = totalBetalteFaste + totalTransaksjoner;

  const ubetalteFaste = fasteKategorier.filter(k => !erBetalt(k));
  const totalInntektBekreftet = inntektKategorier.filter(k => erBetalt(k)).reduce((s, k) => s + beløpForPost(k), 0);

  return (
    <div className="space-y-4 max-w-lg mx-auto md:max-w-none">

      {/* Hero-banner */}
      <div
        className="rounded-2xl p-6"
        style={{ background: "var(--accent)", color: "white" }}
      >
        <p className="text-sm opacity-80 mb-1">{år}</p>
        <h1 className="text-3xl font-bold mb-4" style={{ fontFamily: "var(--font-lora)" }}>
          {MÅNEDER[maned - 1]}
        </h1>
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm opacity-70">Til overs denne måneden</p>
            <p className="text-4xl font-bold" style={{ fontFamily: "var(--font-lora)" }}>
              {tilOvers.toLocaleString("nb-NO")} kr
            </p>
          </div>
          <RegistrerForbruk userId={userId} kategorier={kategorier} onLagret={oppdaterTransaksjoner} variant="hvit" stor />
        </div>
      </div>

      {/* Statskort */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatKort
          ikon="✓"
          verdi={`${antallBetalt}/${fasteKategorier.length}`}
          label="Faste betalt"
          farge={gjenstår === 0 ? "var(--green)" : "var(--amber)"}
          detalj={gjenstår > 0 ? `${gjenstår} gjenstår` : "Alle betalt!"}
        />
        <StatKort
          ikon="💰"
          verdi={`${totalInntekt.toLocaleString("nb-NO")}`}
          label="Inntekt"
          farge="var(--green)"
          detalj="kr denne måneden"
        />
        <StatKort
          ikon="🏠"
          verdi={`${totalFaste.toLocaleString("nb-NO")}`}
          label="Faste utgifter"
          farge="var(--red)"
          detalj="kr denne måneden"
        />
        <StatKort
          ikon="🛒"
          verdi={`${totalBrukt.toLocaleString("nb-NO")}`}
          label="Totalt brukt"
          farge="var(--red)"
          detalj={`regninger + forbruk`}
        />
        {sparingKategorier.length > 0 && (
          <StatKort
            ikon="🐷"
            verdi={`${totalSparing.toLocaleString("nb-NO")}`}
            label="Sparing"
            farge="var(--green)"
            detalj="kr denne måneden"
          />
        )}
        <StatKort
          ikon="🧾"
          verdi={`${transaksjoner.length}`}
          label="Transaksjoner"
          farge="var(--accent)"
          detalj={`${totalTransaksjoner.toLocaleString("nb-NO")} kr`}
        />
      </div>

      {/* AI-innsikt */}
      <AiInnsikt
        navn={brukernavn}
        kategorier={kategorier}
        avvik={avvik}
        transaksjoner={transaksjoner}
        maned={maned}
      />

      {/* Ubekreftet inntekt */}
      {ubekreftedInntekt.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--green)" }}>
          <div className="px-5 py-4 flex items-center gap-3" style={{ background: "var(--green-light)", borderBottom: "1px solid var(--border)" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--green)", color: "white" }}>💰</div>
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--green)" }}>Ubekreftet inntekt</p>
              <p className="text-xs" style={{ color: "var(--green)", opacity: 0.7 }}>
                {ubekreftedInntekt.length} poster · bekreft når pengene er inne
              </p>
            </div>
          </div>
          {ubekreftedInntekt.map((k, idx) => {
            const verdi = beløpForPost(k);
            const avviker = verdi !== k.standard_beløp;
            return (
              <div key={k.id} className="flex items-center gap-3 px-5 py-3"
                style={{ borderBottom: idx < ubekreftedInntekt.length - 1 ? "1px solid var(--border)" : "none" }}>
                <button onClick={() => toggleBetalt(k)} disabled={lagrer === k.id}
                  className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center"
                  style={{ border: "2px solid var(--green)", background: "transparent" }} />
                <span className="flex-1 text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                  {k.navn}
                  {k.eier && k.eier !== "felles" && (
                    <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full" style={{ background: "var(--accent-light)", color: "var(--accent)" }}>{k.eier}</span>
                  )}
                </span>
                <input type="number" defaultValue={verdi || ""} key={`${k.id}-${maned}`}
                  onBlur={(e) => { const ny = Number(e.target.value) || 0; if (ny !== verdi) oppdaterBeløp(k, e.target.value); }}
                  onFocus={(e) => { e.target.style.borderColor = "var(--green)"; }}
                  className="w-20 md:w-28 text-right text-sm px-2 py-1.5 rounded-lg outline-none"
                  style={{ background: avviker ? "white" : "var(--background)", border: `1px solid ${avviker ? "var(--amber)" : "var(--border)"}`, color: avviker ? "var(--amber)" : "var(--text-primary)" }} />
              </div>
            );
          })}
        </div>
      )}

      {/* Ubetalte faste poster */}
      {ubetalteFaste.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <button
            className="w-full flex items-center justify-between px-5 py-4"
            onClick={() => setVisFaste(!visFaste)}
            style={{ borderBottom: visFaste ? "1px solid var(--border)" : "none" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base"
                style={{ background: "var(--amber-light)", color: "var(--amber)" }}>
                ⚡
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  {ubetalteFaste.length} ubetalte poster
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {ubetalteFaste.reduce((s, k) => s + k.standard_beløp, 0).toLocaleString("nb-NO")} kr gjenstår
                </p>
              </div>
            </div>
            <span style={{ color: "var(--text-muted)" }}>{visFaste ? "▲" : "▼"}</span>
          </button>

          {visFaste && ubetalteFaste.map((k, idx) => (
            <div key={k.id} className="flex items-center gap-3 px-5 py-3"
              style={{ borderBottom: idx < ubetalteFaste.length - 1 ? "1px solid var(--border)" : "none" }}>
              <button onClick={() => toggleBetalt(k)} disabled={lagrer === k.id}
                className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center"
                style={{ border: "2px solid var(--border)", background: "transparent" }} />
              <span className="flex-1 text-sm truncate" style={{ color: "var(--text-primary)" }}>{k.navn}</span>
              <input type="number" defaultValue={beløpForPost(k) || ""}
                key={`${k.id}-${maned}`}
                onBlur={(e) => { const ny = Number(e.target.value) || 0; if (ny !== beløpForPost(k)) oppdaterBeløp(k, e.target.value); }}
                onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; }}
                className="w-20 md:w-28 text-right text-sm px-2 py-1.5 rounded-lg outline-none"
                style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            </div>
          ))}
        </div>
      )}

      {/* Betalte faste poster */}
      {antallBetalt > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <button
            className="w-full flex items-center justify-between px-5 py-4"
            onClick={() => setVisBetalte(!visBetalte)}
            style={{ borderBottom: visBetalte ? "1px solid var(--border)" : "none" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "var(--green-light)", color: "var(--green)" }}>✓</div>
              <div className="text-left">
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Betalte poster</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{antallBetalt} av {fasteKategorier.length}</p>
              </div>
            </div>
            <span style={{ color: "var(--text-muted)" }}>{visBetalte ? "▲" : "▼"}</span>
          </button>
          {visBetalte && fasteKategorier.filter(k => erBetalt(k)).map((k, idx, arr) => (
            <div key={k.id} className="flex items-center gap-3 px-5 py-3"
              style={{ borderBottom: idx < arr.length - 1 ? "1px solid var(--border)" : "none", background: "var(--green-light)" }}>
              <button onClick={() => toggleBetalt(k)} disabled={lagrer === k.id}
                className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold"
                style={{ background: "var(--green)", border: "2px solid var(--green)", color: "white" }}>✓</button>
              <span className="flex-1 text-sm truncate" style={{ color: "var(--green)", textDecoration: "line-through", opacity: 0.7 }}>{k.navn}</span>
              <span className="text-sm font-medium" style={{ color: "var(--green)", opacity: 0.8 }}>
                {beløpForPost(k).toLocaleString("nb-NO")} kr
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Transaksjoner */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <button
          className="w-full flex items-center justify-between px-5 py-4"
          onClick={() => setVisTransaksjoner(!visTransaksjoner)}
          style={{ borderBottom: visTransaksjoner && transaksjoner.length > 0 ? "1px solid var(--border)" : "none" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "var(--accent-light)", color: "var(--accent)" }}>🧾</div>
            <div className="text-left">
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Registrert forbruk</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {transaksjoner.length === 0 ? "Ingen ennå — scan en kvittering!" : `${totalTransaksjoner.toLocaleString("nb-NO")} kr totalt`}
              </p>
            </div>
          </div>
          {transaksjoner.length > 0 && <span style={{ color: "var(--text-muted)" }}>{visTransaksjoner ? "▲" : "▼"}</span>}
        </button>
        {visTransaksjoner && transaksjoner.map((t, idx) => (
          <div key={t.id} className="flex items-center gap-3 px-5 py-3"
            style={{ borderBottom: idx < transaksjoner.length - 1 ? "1px solid var(--border)" : "none" }}>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                {t.beskrivelse || kategoriNavn(t.kategori)}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {kategoriNavn(t.kategori)} · {t.dato}
                {t.betalt_av && t.betalt_av !== "felles" ? ` · ${t.betalt_av}` : ""}
              </p>
            </div>
            <span className="text-sm font-semibold shrink-0" style={{ color: t.kilde === "inn" ? "var(--green)" : "var(--red)" }}>
              {t.kilde === "inn" ? "+" : ""}{Math.abs(t.beløp).toLocaleString("nb-NO")} kr
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatKort({ ikon, verdi, label, farge, detalj }: {
  ikon: string; verdi: string; label: string; farge: string; detalj: string;
}) {
  return (
    <div className="rounded-2xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xl">{ikon}</span>
      </div>
      <p className="text-2xl font-bold leading-tight" style={{ fontFamily: "var(--font-lora)", color: farge }}>{verdi}</p>
      <p className="text-xs font-medium mt-0.5" style={{ color: "var(--text-primary)" }}>{label}</p>
      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{detalj}</p>
    </div>
  );
}
