import { createClient } from "@/lib/supabase/server";
import { getDataUserId } from "@/lib/hushold";
import { redirect } from "next/navigation";
import MånedsBetaling from "@/components/budsjett/MånedsBetaling";
import ScanKvittering from "@/components/budsjett/ScanKvittering";

export default async function MaanedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const dataUserId = await getDataUserId(user.id);

  const år = new Date().getFullYear();

  const [{ data: kategorier }, { data: avvik }] = await Promise.all([
    supabase.from("budsjett_kategorier").select("*").eq("user_id", dataUserId).eq("aktiv", true).order("type").order("sortering"),
    supabase.from("budsjett_maneder").select("*").eq("user_id", dataUserId).eq("ar", år),
  ]);

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: "var(--font-lora)", color: "var(--text-primary)" }}>
            Månedsbetaling
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Huk av og juster betalinger — bla mellom måneder
          </p>
        </div>
        <ScanKvittering userId={dataUserId} kategorier={kategorier ?? []} />
      </div>

      <MånedsBetaling
        userId={dataUserId}
        kategorier={kategorier ?? []}
        eksisterendeAvvik={avvik ?? []}
        år={år}
      />
    </div>
  );
}
