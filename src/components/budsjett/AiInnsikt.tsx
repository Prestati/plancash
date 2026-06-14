"use client";

import { useEffect, useState } from "react";
import type { BudsjettKategori, BudsjettMåned } from "@/lib/budsjett";
import { MÅNEDER } from "@/lib/budsjett";

interface Transaksjon {
  id: string;
  beløp: number;
  kategori_id: string | null;
}

interface Innsikt {
  ikon: string;
  tekst: string;
}

export default function AiInnsikt({
  navn,
  kategorier,
  avvik,
  transaksjoner,
  maned,
}: {
  navn: string;
  kategorier: BudsjettKategori[];
  avvik: BudsjettMåned[];
  transaksjoner: Transaksjon[];
  maned: number;
}) {
  const [innsikter, setInnsikter] = useState<Innsikt[] | null>(null);
  const [laster, setLaster] = useState(true);

  useEffect(() => {
    async function hentInnsikt() {
      // Aggreger faktisk forbruk per kategori fra transaksjoner
      const forbrukPerKategori: Record<string, number> = {};
      for (const t of transaksjoner) {
        if (t.kategori_id) {
          forbrukPerKategori[t.kategori_id] = (forbrukPerKategori[t.kategori_id] ?? 0) + t.beløp;
        }
      }

      const forbruksKategorier = ["fast", "gjeld", "abonnement", "forbruk"];
      const kategorierData = kategorier
        .filter(k => k.aktiv && forbruksKategorier.includes(k.type))
        .map(k => {
          const budsjett = avvik.find(a => a.kategori_id === k.id)?.belop ?? k.standard_beløp;
          const forbruk = forbrukPerKategori[k.id] ?? 0;
          return { navn: k.navn, type: k.type, budsjett, forbruk };
        })
        .filter(k => k.budsjett > 0 || k.forbruk > 0);

      if (kategorierData.length === 0) {
        setLaster(false);
        return;
      }

      try {
        const res = await fetch("/api/ai-innsikt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            navn,
            kategorier: kategorierData,
            måned: MÅNEDER[maned - 1],
          }),
        });
        const data = await res.json();
        setInnsikter(Array.isArray(data) ? data : []);
      } catch {
        setInnsikter([]);
      } finally {
        setLaster(false);
      }
    }

    hentInnsikt();
  }, []);

  if (laster) {
    return (
      <div
        className="rounded-2xl p-5 mb-6 animate-pulse"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full" style={{ background: "var(--border)" }} />
          <div className="h-4 w-40 rounded" style={{ background: "var(--border)" }} />
        </div>
        <div className="space-y-2">
          <div className="h-3 rounded w-full" style={{ background: "var(--border)" }} />
          <div className="h-3 rounded w-4/5" style={{ background: "var(--border)" }} />
          <div className="h-3 rounded w-3/4" style={{ background: "var(--border)" }} />
        </div>
      </div>
    );
  }

  if (!innsikter || innsikter.length === 0) return null;

  return (
    <div
      className="rounded-2xl p-5 mb-6"
      style={{
        background: "linear-gradient(135deg, var(--accent-light) 0%, var(--surface) 100%)",
        border: "1.5px solid var(--accent)",
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">✨</span>
        <span className="text-sm font-bold" style={{ color: "var(--accent)", fontFamily: "var(--font-lora)" }}>
          Innsikt for {MÅNEDER[maned - 1].toLowerCase()}
        </span>
      </div>
      <div className="space-y-3">
        {innsikter.map((ins, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="text-xl leading-none mt-0.5 shrink-0">{ins.ikon}</span>
            <p className="text-sm leading-snug" style={{ color: "var(--text-primary)" }}>
              {ins.tekst}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs" style={{ color: "var(--text-muted)" }}>
        Basert på registrert forbruk denne måneden
      </p>
    </div>
  );
}
