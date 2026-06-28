import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDataUserId } from "@/lib/hushold";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Ikke innlogget", { status: 401 });

  const dataUserId = await getDataUserId(user.id);

  const body = await req.json();
  const spørsmål = typeof body.spørsmål === "string"
    ? body.spørsmål.slice(0, 500)
    : null;
  if (!spørsmål) return new Response("Mangler spørsmål", { status: 400 });

  const nå = new Date();
  const år = nå.getFullYear();
  const maned = nå.getMonth() + 1;
  const manadStr = String(maned).padStart(2, "0");
  const nesteManed = maned === 12
    ? `${år + 1}-01-01`
    : `${år}-${String(maned + 1).padStart(2, "0")}-01`;

  type Kategori = { id: string; navn: string; type: string; standard_beløp: number };
  type Avvik = { kategori_id: string; belop: number };
  type Transaksjon = { beløp: number; beskrivelse: string | null; dato: string; kilde: string | null };

  const [{ data: rawKat }, { data: rawAvvik }, { data: rawTrans }, { data: profil }] = await Promise.all([
    supabase.from("budsjett_kategorier").select("id,navn,type,standard_beløp").eq("user_id", dataUserId).eq("aktiv", true),
    supabase.from("budsjett_maneder").select("kategori_id,belop").eq("user_id", dataUserId).eq("ar", år).eq("maned", maned),
    supabase.from("transaksjoner").select("beløp,beskrivelse,dato,kilde")
      .eq("user_id", dataUserId)
      .gte("dato", `${år}-${manadStr}-01`)
      .lt("dato", nesteManed),
    supabase.from("husholdning_profil").select("medlemmer").eq("user_id", dataUserId).single(),
  ]);

  const kategorier = (rawKat ?? []) as unknown as Kategori[];
  const avvik = (rawAvvik ?? []) as unknown as Avvik[];
  const transaksjoner = (rawTrans ?? []) as unknown as Transaksjon[];

  const voksne = ((profil?.medlemmer ?? []) as { aldersgruppe: string; navn: string }[])
    .filter(m => m.aldersgruppe.startsWith("voksen"))
    .map(m => m.navn)
    .join(" og ") || "Bruker";

  const månedNavn = ["januar","februar","mars","april","mai","juni","juli","august","september","oktober","november","desember"][maned - 1];

  const inntekt = kategorier
    .filter(k => k.type === "inntekt")
    .reduce((s, k) => {
      const ov = avvik.find(a => a.kategori_id === k.id);
      return s + (ov ? ov.belop : k.standard_beløp);
    }, 0);

  const faste = kategorier
    .filter(k => ["fast","gjeld","abonnement"].includes(k.type))
    .map(k => {
      const ov = avvik.find(a => a.kategori_id === k.id);
      return `  - ${k.navn}: ${ov ? ov.belop : k.standard_beløp} kr${ov ? " (betalt)" : " (ubetalt)"}`;
    }).join("\n");

  const utgifter = transaksjoner.filter(t => t.kilde !== "inn");
  const pengerInn = transaksjoner.filter(t => t.kilde === "inn");
  const totalUtgifter = utgifter.reduce((s, t) => s + t.beløp, 0);
  const totalInn = pengerInn.reduce((s, t) => s + t.beløp, 0);

  const transaksjonslinjer = utgifter.map(t =>
    `  - ${t.beskrivelse || "ukjent"}: ${t.beløp} kr (${t.dato})`
  ).join("\n");

  const kontekst = `
Du er en personlig økonomi-assistent for ${voksne}. Du hjelper med å forstå budsjettet og forbruket.
Svar alltid på norsk. Vær konkret, vennlig og kortfattet. Bruk tall fra dataene.
Du har KUN tilgang til denne brukerens data — del aldri informasjon om andre brukere.

=== ${voksne}s økonomi — ${månedNavn} ${år} ===

Inntekt denne måneden: ${inntekt.toLocaleString("nb-NO")} kr
Penger inn (ekstra): ${totalInn.toLocaleString("nb-NO")} kr
Registrert forbruk: ${totalUtgifter.toLocaleString("nb-NO")} kr
Til overs (estimert): ${(inntekt + totalInn - totalUtgifter).toLocaleString("nb-NO")} kr

Faste utgifter:
${faste || "  (ingen registrert)"}

Registrerte transaksjoner denne måneden:
${transaksjonslinjer || "  (ingen ennå)"}
`.trim();

  const stream = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 600,
    stream: true,
    system: kontekst,
    messages: [{ role: "user", content: spørsmål }],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
          controller.enqueue(encoder.encode(chunk.delta.text));
        }
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
