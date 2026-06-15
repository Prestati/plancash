import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const client = new Anthropic();

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  // Auth-sjekk
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ feil: "Ikke innlogget" }, { status: 401 });
  }

  const body = await req.json();
  const { bildeBase64, mediaType } = body;

  // Valider input
  if (!bildeBase64 || typeof bildeBase64 !== "string") {
    return NextResponse.json({ feil: "Mangler bilde" }, { status: 400 });
  }
  if (!["image/jpeg", "image/png", "image/webp"].includes(mediaType)) {
    return NextResponse.json({ feil: "Ugyldig bildeformat" }, { status: 400 });
  }

  // Størrelsesbegrensning (~5 MB etter base64-overhead)
  if (bildeBase64.length > MAX_IMAGE_BYTES * 1.37) {
    return NextResponse.json({ feil: "Bildet er for stort (maks 5 MB)" }, { status: 413 });
  }

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: bildeBase64,
            },
          },
          {
            type: "text",
            text: `Les av denne kvitteringen og returner KUN et JSON-objekt (ingen forklaring, bare JSON).

VIKTIGE REGLER:
1. PANT på kvitteringen hører alltid til varen rett over. Legg pant-beløpet til i samme kategori som den tilhørende varen — ikke lag en egen PANT-kategori.
2. Alkohol: Carlsberg, Hansa, Ringnes, Tuborg, Heineken, Smirnoff, Absolut, øl, vin, brennevin, cider = Alkohol-kategorien. Ikke bland disse med Dagligvarer.
3. ZEROH, Coca-Cola, Pepsi, Fanta, Solo, brus, juice, iskaffe = Brus/Godterier, ikke alkohol.
4. Plastpose, bærepose = Husholdning.

Grupper varene slik:
- Dagligvarer (mat, melk, brød, egg, grønnsaker, kjøtt, meieri, yoghurt, etc.)
- Godterier & Snacks (sjokolade, drops, is, potetgull, brus, juice, energidrikk)
- Alkohol (øl, vin, brennevin, cider — se regel 2)
- Tobakk/Snus
- Hygiene/Vaskemidler (sjampo, såpe, vaskemiddel)
- Husholdning (plastpose, tørkepapir, batterier)
- Annet

Returner bare kategorier som faktisk finnes. Slå sammen kategorier under 30 kr med nærmeste.

{
  "dato": "<dato i format YYYY-MM-DD. NB: norske kvitteringer bruker DD.MM.YYYY — konverter riktig, f.eks. 12.06.2026 = 2026-06-12. Null hvis ikke synlig.>",
  "butikk": "<navn på butikk, eller null>",
  "totalBeløp": <totalt beløp som tall>,
  "grupper": [
    {
      "kategoriNavn": "<kategorinavn på norsk>",
      "beløp": <beløp inkl. pant for denne kategorien, som tall>,
      "varer": ["<varenavn>", "<varenavn>"]
    }
  ]
}`,
          },
        ],
      },
    ],
  });

  const tekst = message.content[0].type === "text" ? message.content[0].text : "";

  try {
    const json = JSON.parse(tekst.replace(/```json\n?|\n?```/g, "").trim());
    return NextResponse.json(json);
  } catch {
    return NextResponse.json({ feil: "Kunne ikke lese kvitteringen", rå: tekst }, { status: 422 });
  }
}
