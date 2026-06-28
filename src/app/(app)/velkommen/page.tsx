import { createClient } from "@/lib/supabase/server";
import { getDataUserId } from "@/lib/hushold";
import { redirect } from "next/navigation";
import VelkommenWizard from "./VelkommenWizard";

export default async function VelkommenPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const dataUserId = await getDataUserId(user.id);

  // Hvis brukeren allerede har kategorier, send til dashboard
  const { data: kategorier } = await supabase
    .from("budsjett_kategorier")
    .select("id")
    .eq("user_id", dataUserId)
    .eq("aktiv", true)
    .limit(1);

  if (kategorier?.length) redirect("/dashboard");

  return <VelkommenWizard userId={dataUserId} />;
}
