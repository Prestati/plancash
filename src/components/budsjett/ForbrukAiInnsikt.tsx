"use client";

import { useState } from "react";

interface Transaksjon {
  beskrivelse: string | null;
  beløp: number;
  dato: string;
}

export default function ForbrukAiInnsikt({
  transaksjoner,
  kategoriNavn,
  maaned,
}: {
  transaksjoner: Transaksjon[];
  kategoriNavn: string;
  maaned: string;
}) {
  const [innsikt, setInnsikt] = useState<string | null>(null);
  const [laster, setLaster] = useState(false);

  async function hentInnsikt() {
    setLaster(true);
    const res = await fetch("/api/forbruk-innsikt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transaksjoner, kategoriNavn, maaned }),
    });
    const json = await res.json();
    setInnsikt(json.innsikt ?? "Kunne ikke hente innsikt.");
    setLaster(false);
  }

  if (innsikt) {
    return (
      <div className="rounded-2xl p-5 mb-6" style={{ background: "var(--accent-light)", border: "1.5px solid var(--accent)" }}>
        <div className="flex items-center gap-2 mb-3">
          <span>✨</span>
          <span className="text-sm font-bold" style={{ color: "var(--accent)", fontFamily: "var(--font-lora)" }}>
            AI-innsikt
          </span>
        </div>
        <p className="text-sm whitespace-pre-line" style={{ color: "var(--text-primary)", lineHeight: 1.7 }}>
          {innsikt}
        </p>
        <button
          onClick={() => setInnsikt(null)}
          className="mt-3 text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          Lukk
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={hentInnsikt}
      disabled={laster}
      className="w-full rounded-2xl p-4 mb-6 flex items-center gap-3 text-left transition-opacity disabled:opacity-60"
      style={{ background: "var(--accent-light)", border: "1.5px solid var(--accent)" }}
    >
      <span className="text-xl">{laster ? "⏳" : "✨"}</span>
      <div>
        <p className="text-sm font-semibold" style={{ color: "var(--accent)" }}>
          {laster ? "Analyserer forbruket..." : "Få AI-innsikt om dette forbruket"}
        </p>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          {laster ? "Dette tar et sekund" : "Hva går pengene til? Mønstre og tips"}
        </p>
      </div>
    </button>
  );
}
