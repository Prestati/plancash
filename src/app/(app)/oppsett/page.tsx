import { createClient } from "@/lib/supabase/server";
import HusholdOppsett from "@/components/oppsett/HusholdOppsett";
import InviterFamiliemedlem from "@/components/oppsett/InviterFamiliemedlem";
import EndrePassord from "@/components/oppsett/EndrePassord";

export default async function OppsettPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profil } = await supabase
    .from("husholdning_profil")
    .select("*")
    .eq("user_id", user!.id)
    .single();

  return (
    <div>
      <div className="mb-8">
        <h1
          className="text-3xl font-bold mb-1"
          style={{ fontFamily: "var(--font-lora)", color: "var(--text-primary)" }}
        >
          Husholdet ditt
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Legg inn hvem som er i husholdet så beregner vi SIFO-referansetall for akkurat din familie
        </p>
      </div>
      <div className="space-y-6">
        <HusholdOppsett userId={user!.id} eksisterendeProfil={profil} />
        <InviterFamiliemedlem userId={user!.id} />
        <EndrePassord />
      </div>
    </div>
  );
}
