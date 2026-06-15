import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ feil: "Ikke innlogget" }, { status: 401 });

  const { epost } = await req.json();
  if (!epost || typeof epost !== "string") {
    return NextResponse.json({ feil: "Mangler e-post" }, { status: 400 });
  }

  // Opprett invitasjon i databasen
  const { data: invitasjon, error } = await supabase
    .from("hushold_invitasjoner")
    .insert({ eier_user_id: user.id, epost: epost.trim() })
    .select()
    .single();

  if (error || !invitasjon) {
    return NextResponse.json({ feil: "Kunne ikke opprette invitasjon" }, { status: 500 });
  }

  const origin = new URL(req.url).origin;
  const manuellLenke = `${origin}/bli-med/${invitasjon.token}`;
  const redirectTo = `${origin}/auth/aksepter?token=${invitasjon.token}`;

  // Send invitasjonsmail via Supabase admin
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { error: inviteError } = await admin.auth.admin.inviteUserByEmail(epost.trim(), {
    redirectTo,
  });

  // Returner den manuelle lenken (ikke aksepter-URLen som er til e-post)
  return NextResponse.json({ link: manuellLenke, epostSendt: !inviteError });
}
