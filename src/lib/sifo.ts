// SIFO referansebudsjett 2026 (kr/mnd)
// Kilde: SIFO / OsloMet — https://www.oslomet.no/om/sifo/referansebudsjettet
// NB: Tallene for 2026 er estimert basert på 2024-tall + prisjustering ~4%

export type AgeGroup = "barn_0_1" | "barn_2_5" | "barn_6_9" | "barn_10_13" | "barn_14_17" | "voksen_18_30" | "voksen_31_50" | "voksen_51_66" | "voksen_67+";
// AgeGroup er alias for AldersGruppe i types.ts — samme verdier

export type Kjønn = "gutt" | "jente" | "mann" | "kvinne";

export const SIFO_KATEGORIER = {
  mat_drikke: "Mat og drikke",
  klær_sko: "Klær og sko",
  personlig_pleie: "Personlig pleie",
  lek_medier: "Lek og medier",
  andre_dagligvarer: "Andre dagligvarer",
  helse: "Helse",
  transport: "Transport",
  barnehage_sfo: "Barnehage / SFO",
} as const;

type SifoKategori = keyof typeof SIFO_KATEGORIER;

// Basisbeløp (nøytral / mannlig) per aldersgruppe (kr/mnd)
const SIFO_BASIS: Record<AgeGroup, Record<SifoKategori, number>> = {
  voksen_31_50: {
    mat_drikke: 3710, klær_sko: 620, personlig_pleie: 380,
    lek_medier: 720, andre_dagligvarer: 320, helse: 290, transport: 4100, barnehage_sfo: 0,
  },
  voksen_18_30: {
    mat_drikke: 3330, klær_sko: 720, personlig_pleie: 420,
    lek_medier: 750, andre_dagligvarer: 320, helse: 250, transport: 4100, barnehage_sfo: 0,
  },
  voksen_51_66: {
    mat_drikke: 3430, klær_sko: 510, personlig_pleie: 370,
    lek_medier: 645, andre_dagligvarer: 320, helse: 450, transport: 4100, barnehage_sfo: 0,
  },
  "voksen_67+": {
    mat_drikke: 3220, klær_sko: 440, personlig_pleie: 340,
    lek_medier: 580, andre_dagligvarer: 320, helse: 615, transport: 2910, barnehage_sfo: 0,
  },
  barn_0_1: {
    mat_drikke: 615, klær_sko: 385, personlig_pleie: 300,
    lek_medier: 240, andre_dagligvarer: 260, helse: 105, transport: 0, barnehage_sfo: 0,
  },
  barn_2_5: {
    mat_drikke: 1925, klær_sko: 540, personlig_pleie: 280,
    lek_medier: 520, andre_dagligvarer: 260, helse: 105, transport: 0, barnehage_sfo: 3448,
  },
  barn_6_9: {
    mat_drikke: 2185, klær_sko: 655, personlig_pleie: 230,
    lek_medier: 705, andre_dagligvarer: 260, helse: 125, transport: 0, barnehage_sfo: 2205,
  },
  barn_10_13: {
    mat_drikke: 2495, klær_sko: 730, personlig_pleie: 280,
    lek_medier: 810, andre_dagligvarer: 260, helse: 145, transport: 0, barnehage_sfo: 0,
  },
  barn_14_17: {
    mat_drikke: 2960, klær_sko: 875, personlig_pleie: 490,
    lek_medier: 935, andre_dagligvarer: 260, helse: 175, transport: 790, barnehage_sfo: 0,
  },
};

// Kjønnstillegg (kr/mnd) — kun der SIFO faktisk skiller
// Kilde: SIFO differensierer klær/sko og personlig pleie mellom kjønn fra 10 år
const SIFO_KJØNN_TILLEGG: Partial<Record<AgeGroup, Partial<Record<SifoKategori, Record<Kjønn, number>>>>> = {
  barn_10_13: {
    klær_sko: { gutt: 0, jente: 130, mann: 0, kvinne: 130 },
    personlig_pleie: { gutt: 0, jente: 90, mann: 0, kvinne: 90 },
  },
  barn_14_17: {
    klær_sko: { gutt: 0, jente: 200, mann: 0, kvinne: 200 },
    personlig_pleie: { gutt: 0, jente: 250, mann: 0, kvinne: 250 },
  },
  voksen_18_30: {
    klær_sko: { gutt: 0, jente: 300, mann: 0, kvinne: 300 },
    personlig_pleie: { gutt: 0, jente: 320, mann: 0, kvinne: 320 },
  },
  voksen_31_50: {
    klær_sko: { gutt: 0, jente: 240, mann: 0, kvinne: 240 },
    personlig_pleie: { gutt: 0, jente: 280, mann: 0, kvinne: 280 },
  },
  voksen_51_66: {
    klær_sko: { gutt: 0, jente: 180, mann: 0, kvinne: 180 },
    personlig_pleie: { gutt: 0, jente: 200, mann: 0, kvinne: 200 },
  },
  "voksen_67+": {
    klær_sko: { gutt: 0, jente: 130, mann: 0, kvinne: 130 },
    personlig_pleie: { gutt: 0, jente: 150, mann: 0, kvinne: 150 },
  },
};

export interface SifoMedlem {
  aldersgruppe: AgeGroup;
  kjønn?: Kjønn;
}

function sifoForMedlem(m: SifoMedlem): Record<SifoKategori, number> {
  const basis = { ...SIFO_BASIS[m.aldersgruppe] };
  if (m.kjønn) {
    const tillegg = SIFO_KJØNN_TILLEGG[m.aldersgruppe];
    if (tillegg) {
      for (const [kat, kjønnsTillegg] of Object.entries(tillegg) as [SifoKategori, Record<Kjønn, number>][]) {
        basis[kat] += kjønnsTillegg[m.kjønn] ?? 0;
      }
    }
  }
  return basis;
}

export function beregnSifoPrKategori(
  medlemmer: (AgeGroup | SifoMedlem)[]
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const m of medlemmer) {
    const sifoMedlem: SifoMedlem = typeof m === "string" ? { aldersgruppe: m } : m;
    const beløp = sifoForMedlem(sifoMedlem);
    for (const [kat, val] of Object.entries(beløp)) {
      result[kat] = (result[kat] ?? 0) + val;
    }
  }
  return result;
}

export function beregnSifoTotal(medlemmer: (AgeGroup | SifoMedlem)[]): number {
  return Object.values(beregnSifoPrKategori(medlemmer)).reduce((a, b) => a + b, 0);
}
