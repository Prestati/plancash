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

REGLER:
- PANT legges til varen rett over (ikke egen linje)
- Lag én linje per vare med et lesbart navn og foreslå kategori
- Kategorier å velge mellom: Dagligvarer, Godterier & Snacks, Alkohol, Tobakk/Snus, Hygiene, Husholdning, Klær & Sko, Utemat, Helse, Annet
- Alkohol: øl, vin, brennevin, cider
- Brus/juice = Godterier & Snacks
- Plastpose = Husholdning

{
  "dato": "<YYYY-MM-DD, norsk format DD.MM.YYYY → konverter riktig. Null hvis ikke synlig.>",
  "butikk": "<butikknavn eller null>",
  "totalBeløp": <totalt beløp som tall>,
  "linjer": [
    {
      "navn": "<lesbart varenavn, f.eks. 'Havregrynbrød' ikke 'COOP HAVREGR.'>",
      "beløp": <beløp inkl. evt. pant, som tall>,
      "kategori": "<foreslått kategori>"
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
