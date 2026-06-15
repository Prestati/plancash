import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ feil: "Ikke innlogget" }, { status: 401 });

  const { transaksjoner, kategoriNavn, maaned } = await req.json();
  if (!transaksjoner?.length) return NextResponse.json({ feil: "Ingen transaksjoner" }, { status: 400 });

  const total = transaksjoner.reduce((s: number, t: { beløp: number }) => s + t.beløp, 0);
  const poster = transaksjoner
    .map((t: { beskrivelse: string; beløp: number; dato: string }) =>
      `- ${t.beskrivelse || "Ukjent"}: ${t.beløp.toLocaleString("nb-NO")} kr (${t.dato})`
    )
    .join("\n");

  const melding = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 300,
    messages: [{
      role: "user",
      content: `Du er en vennlig norsk økonomiassistent. Analyser dette forbruket for kategorien "${kategoriNavn}" i ${maaned}:

Totalt: ${total.toLocaleString("nb-NO")} kr
Poster:
${poster}

Gi 2-3 korte, konkrete innsikter på norsk. Fokuser på mønstre, hyppige kjøp, og om noe skiller seg ut. Vær direkte og nyttig. Ikke bruk overskrifter, bare vanlig tekst med linjeskift mellom innsiktene.`,
    }],
  });

  const tekst = melding.content[0].type === "text" ? melding.content[0].text : "";
  return NextResponse.json({ innsikt: tekst });
}
