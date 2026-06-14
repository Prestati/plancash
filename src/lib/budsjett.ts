export type BudsjettType = "inntekt" | "fast" | "gjeld" | "abonnement" | "forbruk" | "sparing";

export interface BudsjettKategori {
  id: string;
  user_id: string;
  navn: string;
  type: BudsjettType;
  standard_beløp: number;
  ikon: string | null;
  eier: string;
  konto: string | null;
  sortering: number;
  aktiv: boolean;
}

export interface BudsjettMåned {
  id: string;
  kategori_id: string;
  ar: number;
  maned: number;
  belop: number;
  notat: string | null;
}

export const TYPE_CONFIG: Record<BudsjettType, { label: string; ikon: string; farge: string; beskrivelse: string }> = {
  inntekt:     { label: "Inntekter",        ikon: "💰", farge: "--green",   beskrivelse: "Lønn, barnetrygd, bonus, osv." },
  fast:        { label: "Faste kostnader",  ikon: "🏠", farge: "--red",     beskrivelse: "Strøm, internett, forsikring, SFO, osv." },
  gjeld:       { label: "Gjeld & lån",      ikon: "🏦", farge: "--red",     beskrivelse: "Boliglån, billån, studielån, osv." },
  abonnement:  { label: "Abonnement",       ikon: "📱", farge: "--red",    beskrivelse: "Netflix, Spotify, treningssenter, osv." },
  forbruk:     { label: "Forbruk",          ikon: "🛒", farge: "--red",    beskrivelse: "Dagligvare, klær, utemat, osv." },
  sparing:     { label: "Sparing",          ikon: "🎯", farge: "--green",   beskrivelse: "Buffer, fond, ferie, spesifikke mål" },
};

export const MÅNEDER = ["Januar","Februar","Mars","April","Mai","Juni","Juli","August","September","Oktober","November","Desember"];

// Beløp for en kategori i en gitt måned — bruker månedlig avvik hvis det finnes
export function beløpForMåned(
  kategori: BudsjettKategori,
  avvik: BudsjettMåned[]
): number {
  const override = avvik.find((a) => a.kategori_id === kategori.id);
  return override ? override.belop : kategori.standard_beløp;
}

export function sumForType(
  kategorier: BudsjettKategori[],
  type: BudsjettType,
  avvik: BudsjettMåned[]
): number {
  return kategorier
    .filter((k) => k.type === type && k.aktiv)
    .reduce((sum, k) => sum + beløpForMåned(k, avvik), 0);
}
