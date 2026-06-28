import { createClient } from "@/lib/supabase/server";
import { getDataUserId } from "@/lib/hushold";
import { redirect } from "next/navigation";
import GjeldsplanKlient from "./GjeldsplanKlient";

export default async function GjeldsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const dataUserId = await getDataUserId(user.id);

  const { data: profil } = await supabase
    .from("husholdning_profil")
    .select("medlemmer")
    .eq("user_id", dataUserId)
    .single();

  const voksne = (profil?.medlemmer ?? [])
    .filter((m: { aldersgruppe: string; navn: string }) => m.aldersgruppe.startsWith("voksen"))
    .map((m: { navn: string }) => m.navn);

  return <GjeldsplanKlient userId={dataUserId} voksne={voksne} />;
}
