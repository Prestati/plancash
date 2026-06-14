import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { bildeBase64, mediaType } = await req.json();

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

Grupper varene i meningsfulle kategorier basert på hva de er. Typiske kategorier:
- Dagligvarer (mat, melk, brød, grønnsaker, kjøtt, etc.)
- Godterier (sjokolade, drops, is, snacks, brus)
- Alkohol (øl, vin, brennevin)
- Tobakk/Snus
- Hygiene/Vaskemidler (sjampo, såpe, vaskemiddel, tannbørste)
- Husholdning (tørkepapir, batterier, lyspærer)
- Annet (det som ikke passer andre steder)

Returner bare kategorier som faktisk finnes på kvitteringen. Slå gjerne sammen veldig små kategorier med Dagligvarer hvis de er under 20 kr.

{
  "dato": "<dato i format YYYY-MM-DD, eller null hvis ikke synlig>",
  "butikk": "<navn på butikk/sted, eller null>",
  "totalBeløp": <totalt beløp som tall>,
  "grupper": [
    {
      "kategoriNavn": "<kategorinavn på norsk>",
      "beløp": <beløp som tall>,
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
