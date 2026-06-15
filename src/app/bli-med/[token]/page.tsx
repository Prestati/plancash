import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import BliMedSkjema from "./BliMedSkjema";

export default async function BliMedPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  // Bruk admin-klient for å lese invitasjon (omgår RLS for uautentiserte)
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const { data: invitasjon } = await admin
    .from("hushold_invitasjoner")
    .select("*")
    .eq("token", token)
    .eq("status", "venter")
    .single();

  if (!invitasjon) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--background)" }}>
        <div className="rounded-2xl p-8 text-center max-w-sm" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="text-4xl mb-4">❌</div>
          <h1 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-lora)", color: "var(--text-primary)" }}>
            Ugyldig invitasjon
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Lenken er enten utløpt eller allerede brukt.
          </p>
        </div>
      </div>
    );
  }

  // Hvis logget inn — aksepter og redirect
  if (user) {
    if (user.id === invitasjon.eier_user_id) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--background)" }}>
          <div className="rounded-2xl p-8 text-center max-w-sm" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="text-4xl mb-4">🤔</div>
            <h1 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-lora)", color: "var(--text-primary)" }}>
              Dette er din egen invitasjon
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Del lenken med familiemedlemmet ditt!
            </p>
          </div>
        </div>
      );
    }

    await Promise.all([
      supabase.from("hushold_tilgang").upsert({
        eier_user_id: invitasjon.eier_user_id,
        medlem_user_id: user.id,
      }),
      supabase.from("hushold_invitasjoner").update({ status: "akseptert" }).eq("id", invitasjon.id),
    ]);

    redirect("/dashboard");
  }

  // Ikke logget inn — vis innebygd skjema
  return <BliMedSkjema token={token} epost={invitasjon.epost} />;
}
