"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ALDERSGRUPPE_LABELS, alderTilGruppe, type AldersGruppe, type Kjønn, type HusholdMedlem } from "@/lib/types";
import { beregnSifoPrKategori, SIFO_KATEGORIER } from "@/lib/sifo";

const KJØNN_VALG: { verdi: Kjønn; label: string; ikon: string }[] = [
  { verdi: "jente", label: "Jente", ikon: "👧" },
  { verdi: "gutt", label: "Gutt", ikon: "👦" },
  { verdi: "kvinne", label: "Kvinne", ikon: "👩" },
  { verdi: "mann", label: "Mann", ikon: "👨" },
];

function ikonForMedlem(m: HusholdMedlem): string {
  const match = KJØNN_VALG.find((k) => k.verdi === m.kjønn);
  return match?.ikon ?? "🧑";
}

function defaultKjønn(ag: AldersGruppe): Kjønn {
  return ag.startsWith("barn") ? "jente" : "kvinne";
}

export default function HusholdOppsett({
  userId,
  eksisterendeProfil,
}: {
  userId: string;
  eksisterendeProfil: { medlemmer: HusholdMedlem[] } | null;
}) {
  const router = useRouter();
  const [medlemmer, setMedlemmer] = useState<HusholdMedlem[]>(
    eksisterendeProfil?.medlemmer ?? []
  );
  const [navn, setNavn] = useState("");
  const [alder, setAlder] = useState("");
  const [kjønn, setKjønn] = useState<Kjønn>("jente");
  const [lagrer, setLagrer] = useState(false);
  const [lagret, setLagret] = useState(false);

  // Oppdater kjønns-default når alder endres
  function håndterAlderEndring(nyAlder: string) {
    setAlder(nyAlder);
    if (nyAlder) {
      const ag = alderTilGruppe(Number(nyAlder));
      setKjønn(defaultKjønn(ag));
    }
  }

  const sifoMedlemmer = medlemmer.map((m) => ({
    aldersgruppe: m.aldersgruppe,
    kjønn: m.kjønn,
  }));
  const sifoRef = beregnSifoPrKategori(sifoMedlemmer);
  const sifoTotal = Object.values(sifoRef).reduce((a, b) => a + b, 0);

  function leggTil() {
    if (!navn.trim() || !alder) return;
    const aldersgruppe = alderTilGruppe(Number(alder));
    setMedlemmer([
      ...medlemmer,
      { id: crypto.randomUUID(), navn: navn.trim(), aldersgruppe, kjønn },
    ]);
    setNavn("");
    setAlder("");
    setKjønn("jente");
  }

  function fjern(id: string) {
    setMedlemmer(medlemmer.filter((m) => m.id !== id));
  }

  async function lagre() {
    setLagrer(true);
    const supabase = createClient();
    await supabase.from("husholdning_profil").upsert({
      user_id: userId,
      medlemmer,
      updated_at: new Date().toISOString(),
    });
    setLagret(true);
    setLagrer(false);
    setTimeout(() => {
      router.push("/plancash");
      router.refresh();
    }, 800);
  }

  const erBarn = alder ? alderTilGruppe(Number(alder)).startsWith("barn") : true;
  const relevantKjønn = erBarn
    ? KJØNN_VALG.filter((k) => k.verdi === "jente" || k.verdi === "gutt")
    : KJØNN_VALG.filter((k) => k.verdi === "kvinne" || k.verdi === "mann");

  return (
    <div className="max-w-2xl space-y-6">
      {/* Legg til person */}
      <div
        className="rounded-2xl p-6"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <h2
          className="font-bold text-lg mb-4"
          style={{ fontFamily: "var(--font-lora)", color: "var(--text-primary)" }}
        >
          Legg til person
        </h2>

        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Navn
            </label>
            <input
              type="text"
              value={navn}
              onChange={(e) => setNavn(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && leggTil()}
              placeholder="f.eks. Karoline"
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{
                background: "var(--background)",
                border: "1.5px solid var(--border)",
                color: "var(--text-primary)",
              }}
            />
          </div>
          <div className="w-24">
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Alder
            </label>
            <input
              type="number"
              value={alder}
              onChange={(e) => håndterAlderEndring(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && leggTil()}
              placeholder="36"
              min={0}
              max={100}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{
                background: "var(--background)",
                border: "1.5px solid var(--border)",
                color: "var(--text-primary)",
              }}
            />
          </div>
        </div>

        {/* Kjønnsvalg */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
            Kjønn <span className="text-xs font-normal" style={{ color: "var(--text-muted)" }}>(påvirker SIFO-tall for klær og pleie)</span>
          </label>
          <div className="flex gap-2">
            {relevantKjønn.map((k) => (
              <button
                key={k.verdi}
                onClick={() => setKjønn(k.verdi)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: kjønn === k.verdi ? "var(--accent)" : "var(--background)",
                  color: kjønn === k.verdi ? "white" : "var(--text-secondary)",
                  border: `1.5px solid ${kjønn === k.verdi ? "var(--accent)" : "var(--border)"}`,
                }}
              >
                <span>{k.ikon}</span>
                <span>{k.label}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={leggTil}
          disabled={!navn.trim() || !alder}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-40"
          style={{ background: "var(--accent)" }}
        >
          + Legg til
        </button>
      </div>

      {/* Hushold-liste */}
      {medlemmer.length > 0 && (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div
            className="px-6 py-3 text-xs font-semibold uppercase tracking-wider"
            style={{ background: "var(--background)", color: "var(--text-muted)", borderBottom: "1px solid var(--border)" }}
          >
            {medlemmer.length} person{medlemmer.length !== 1 ? "er" : ""} i husholdet
          </div>

          {medlemmer.map((m, idx) => (
            <div
              key={m.id}
              className="flex items-center gap-4 px-6 py-4"
              style={{ borderBottom: idx < medlemmer.length - 1 ? "1px solid var(--border)" : "none" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ background: "var(--accent-light)" }}
              >
                {ikonForMedlem(m)}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                  {m.navn}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {ALDERSGRUPPE_LABELS[m.aldersgruppe]} · {KJØNN_VALG.find(k => k.verdi === m.kjønn)?.label ?? ""}
                </p>
              </div>
              <button
                onClick={() => fjern(m.id)}
                className="text-sm px-3 py-1 rounded-lg transition-colors"
                style={{ color: "var(--text-muted)" }}
                onMouseOver={(e) => (e.currentTarget.style.color = "var(--red)")}
                onMouseOut={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
              >
                Fjern
              </button>
            </div>
          ))}
        </div>
      )}

      {/* SIFO-forhåndsvisning */}
      {medlemmer.length > 0 && (
        <div
          className="rounded-2xl p-6"
          style={{ background: "var(--accent-light)", border: "1px solid var(--accent)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm" style={{ color: "var(--accent)" }}>
              SIFO-referansebudsjett for din familie
            </h3>
            <span className="text-lg font-bold" style={{ fontFamily: "var(--font-lora)", color: "var(--accent)" }}>
              {sifoTotal.toLocaleString("nb-NO")} kr/mnd
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(Object.entries(SIFO_KATEGORIER) as [string, string][]).map(([key, label]) => {
              const val = sifoRef[key] ?? 0;
              if (val === 0) return null;
              return (
                <div key={key} className="flex justify-between text-sm">
                  <span style={{ color: "var(--accent)" }}>{label}</span>
                  <span className="font-medium" style={{ color: "var(--accent)" }}>
                    {val.toLocaleString("nb-NO")} kr
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-xs mt-3" style={{ color: "var(--accent)" }}>
            * Bolig, sparing og gjeld er ikke inkludert i SIFO-tallene
          </p>
        </div>
      )}

      {/* Lagre */}
      {medlemmer.length > 0 && (
        <button
          onClick={lagre}
          disabled={lagrer || lagret}
          className="w-full py-3 rounded-xl font-semibold text-white transition-all"
          style={{ background: lagret ? "var(--green)" : "var(--accent)" }}
        >
          {lagret ? "Lagret! Sender deg til budsjettet..." : lagrer ? "Lagrer..." : "Lagre hushold og gå til budsjett →"}
        </button>
      )}

      {medlemmer.length === 0 && (
        <p className="text-sm text-center py-4" style={{ color: "var(--text-muted)" }}>
          Legg til minst én person for å se SIFO-referansetall
        </p>
      )}
    </div>
  );
}
