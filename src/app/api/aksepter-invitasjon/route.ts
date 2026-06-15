import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ feil: "Ikke innlogget" }, { status: 401 });

  const { token } = await req.json();

  const { data: invitasjon } = await supabase
    .from("hushold_invitasjoner")
    .select("*")
    .eq("token", token)
    .eq("status", "venter")
    .single();

  if (!invitasjon) return NextResponse.json({ feil: "Ugyldig invitasjon" }, { status: 404 });

  await Promise.all([
    supabase.from("hushold_tilgang").upsert({
      eier_user_id: invitasjon.eier_user_id,
      medlem_user_id: user.id,
    }),
    supabase.from("hushold_invitasjoner").update({ status: "akseptert" }).eq("id", invitasjon.id),
  ]);

  return NextResponse.json({ ok: true });
}
