import { createClient } from "@/lib/supabase/server";
import { getDataUserId } from "@/lib/hushold";
import { redirect } from "next/navigation";
import BudsjettOppsett from "@/components/budsjett/BudsjettOppsett";
import MånedsBetaling from "@/components/budsjett/MånedsBetaling";
import BudsjettTabs from "@/components/budsjett/BudsjettTabs";

export default async function BudsjettPage({
  searchParams,
}: {
  searchParams: Promise<{ fane?: string }>;
}) {
  const { fane } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const dataUserId = await getDataUserId(user.id);

  const nå = new Date();
  const år = nå.getFullYear();

  const [{ data: kategorier }, { data: hushold }, { data: avvik }] = await Promise.all([
    supabase.from("budsjett_kategorier").select("*").eq("user_id", dataUserId).eq("aktiv", true).order("type").order("sortering"),
    supabase.from("husholdning_profil").select("medlemmer").eq("user_id", dataUserId).single(),
    supabase.from("budsjett_maneder").select("*").eq("user_id", dataUserId).eq("ar", år),
  ]);

  return (
    <div>
      <BudsjettTabs aktivFane={fane ?? "oppsett"}>
        <BudsjettOppsett
          userId={dataUserId}
          eksisterendeKategorier={kategorier ?? []}
          husholdMedlemmer={hushold?.medlemmer ?? []}
        />
        <MånedsBetaling
          userId={dataUserId}
          kategorier={kategorier ?? []}
          eksisterendeAvvik={avvik ?? []}
          år={år}
        />
      </BudsjettTabs>
    </div>
  );
}
