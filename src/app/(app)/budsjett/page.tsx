import { createClient } from "@/lib/supabase/server";
import { getDataUserId } from "@/lib/hushold";
import { redirect } from "next/navigation";
import BudsjettOppsett from "@/components/budsjett/BudsjettOppsett";

export default async function BudsjettPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const dataUserId = await getDataUserId(user.id);

  const { data: kategorier } = await supabase
    .from("budsjett_kategorier")
    .select("*")
    .eq("user_id", dataUserId)
    .eq("aktiv", true)
    .order("type")
    .order("sortering");

  const { data: hushold } = await supabase
    .from("husholdning_profil")
    .select("medlemmer")
    .eq("user_id", dataUserId)
    .single();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: "var(--font-lora)", color: "var(--text-primary)" }}>
          Budsjettoppsett
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Legg inn hva livet ditt koster — én gang. Månedene justerer du etterpå.
        </p>
      </div>
      <BudsjettOppsett
        userId={dataUserId}
        eksisterendeKategorier={kategorier ?? []}
        husholdMedlemmer={hushold?.medlemmer ?? []}
      />
    </div>
  );
}
