export type AldersGruppe =
  | "barn_0_1"
  | "barn_2_5"
  | "barn_6_9"
  | "barn_10_13"
  | "barn_14_17"
  | "voksen_18_30"
  | "voksen_31_50"
  | "voksen_51_66"
  | "voksen_67+";

export type Kjønn = "gutt" | "jente" | "mann" | "kvinne";

export interface HusholdMedlem {
  id: string;
  navn: string;
  aldersgruppe: AldersGruppe;
  kjønn: Kjønn;
}

export const ALDERSGRUPPE_LABELS: Record<AldersGruppe, string> = {
  barn_0_1: "Baby (0–1 år)",
  barn_2_5: "Småbarn (2–5 år)",
  barn_6_9: "Barn (6–9 år)",
  barn_10_13: "Barn (10–13 år)",
  barn_14_17: "Ungdom (14–17 år)",
  voksen_18_30: "Voksen (18–30 år)",
  voksen_31_50: "Voksen (31–50 år)",
  voksen_51_66: "Voksen (51–66 år)",
  "voksen_67+": "Senior (67+ år)",
};

export function alderTilGruppe(alder: number): AldersGruppe {
  if (alder <= 1) return "barn_0_1";
  if (alder <= 5) return "barn_2_5";
  if (alder <= 9) return "barn_6_9";
  if (alder <= 13) return "barn_10_13";
  if (alder <= 17) return "barn_14_17";
  if (alder <= 30) return "voksen_18_30";
  if (alder <= 50) return "voksen_31_50";
  if (alder <= 66) return "voksen_51_66";
  return "voksen_67+";
}
