import { createClient } from "@/lib/supabase/server";
import { getDataUserId } from "@/lib/hushold";
import { redirect } from "next/navigation";
import MånedsOversikt from "@/components/budsjett/MånedsOversikt";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const dataUserId = await getDataUserId(user.id);

  const nå = new Date();
  const år = nå.getFullYear();
  const maned = nå.getMonth() + 1;
  const manadStr = String(maned).padStart(2, "0");

  const harKategorier = await supabase
    .from("budsjett_kategorier")
    .select("id")
    .eq("user_id", dataUserId)
    .eq("aktiv", true)
    .limit(1);

  if (!harKategorier.data?.length) redirect("/budsjett");

  const [{ data: kategorier }, { data: avvik }, { data: transaksjoner }, { data: profil }] = await Promise.all([
    supabase.from("budsjett_kategorier").select("*").eq("user_id", dataUserId).eq("aktiv", true).order("type").order("sortering"),
    supabase.from("budsjett_maneder").select("*").eq("user_id", dataUserId).eq("ar", år).eq("maned", maned),
    supabase.from("transaksjoner").select("*").eq("user_id", dataUserId)
      .gte("dato", `${år}-${manadStr}-01`)
      .lt("dato", maned === 12 ? `${år + 1}-01-01` : `${år}-${String(maned + 1).padStart(2, "0")}-01`)
      .order("dato", { ascending: false }),
    supabase.from("husholdning_profil").select("medlemmer").eq("user_id", dataUserId).single(),
  ]);

  const voksne = (profil?.medlemmer ?? [])
    .filter((m: { aldersgruppe: string; navn: string }) => m.aldersgruppe.startsWith("voksen"))
    .map((m: { navn: string }) => m.navn);

  const brukernavn = voksne.length > 0
    ? voksne.join(" og ")
    : user.email?.split("@")[0]?.split(/[._]/).map((d: string) => d.charAt(0).toUpperCase() + d.slice(1)).join(" ") ?? "deg";

  return (
    <MånedsOversikt
      userId={dataUserId}
      brukernavn={brukernavn}
      kategorier={kategorier ?? []}
      avvik={avvik ?? []}
      transaksjoner={transaksjoner ?? []}
      år={år}
    />
  );
}
