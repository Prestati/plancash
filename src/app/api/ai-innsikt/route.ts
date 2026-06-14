import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

interface KategoriData {
  navn: string;
  type: string;
  budsjett: number;
  forbruk: number;
}

export async function POST(req: NextRequest) {
  const { navn, kategorier, måned }: { navn: string; kategorier: KategoriData[]; måned: string } = await req.json();

  const forbrukLinjer = kategorier
    .filter(k => k.forbruk > 0 || k.budsjett > 0)
    .map(k => {
      const diff = k.forbruk - k.budsjett;
      const pst = k.budsjett > 0 ? Math.round((diff / k.budsjett) * 100) : null;
      const status = diff > 0 ? `${pst}% over` : diff < 0 ? `${Math.abs(pst ?? 0)}% under` : "akkurat i mål";
      return `- ${k.navn} (${k.type}): budsjett ${k.budsjett} kr, faktisk ${k.forbruk} kr → ${status}`;
    })
    .join("\n");

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 600,
    messages: [
      {
        role: "user",
        content: `Du er en vennlig og praktisk norsk privatøkonomi-rådgiver. Brukeren heter ${navn}.

Her er ${navn} sitt forbruk i ${måned} sammenlignet med budsjettet:
${forbrukLinjer}

Skriv 2-3 korte, konkrete og oppmuntrende observasjoner på norsk. Vær direkte og personlig — bruk fornavn.
Nevn spesifikke tall. Foreslå én praktisk handling der det er relevant (justere budsjett, kutte ned, eller ros for god kontroll).
Svar KUN med et JSON-array med objekter som har disse feltene:
[
  { "ikon": "<ett emoji>", "tekst": "<observasjon, maks 120 tegn>" }
]
Ingen forklaring utenfor JSON.`,
      },
    ],
  });

  const rå = message.content[0].type === "text" ? message.content[0].text : "[]";
  try {
    const json = JSON.parse(rå.replace(/```json\n?|\n?```/g, "").trim());
    return NextResponse.json(json);
  } catch {
    return NextResponse.json([], { status: 422 });
  }
}
