import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { bildeBase64, mediaType } = await req.json();

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
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
            text: `Les av denne kvitteringen og returner KUN et JSON-objekt med disse feltene (ingen forklaring, bare JSON):
{
  "beløp": <totalt beløp som tall, ikke tekst>,
  "dato": "<dato i format YYYY-MM-DD, eller null hvis ikke synlig>",
  "butikk": "<navn på butikk/sted, eller null>",
  "beskrivelse": "<kort beskrivelse av hva som ble kjøpt, maks 50 tegn>"
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
