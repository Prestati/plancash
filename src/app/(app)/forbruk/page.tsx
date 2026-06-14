import { createClient } from "@/lib/supabase/server";
import { getDataUserId } from "@/lib/hushold";
import { redirect } from "next/navigation";
import ForbrukTabell from "@/components/budsjett/ForbrukTabell";
import RegistrerForbruk from "@/components/budsjett/RegistrerForbruk";

export default async function ForbrukPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const dataUserId = await getDataUserId(user.id);

  const år = new Date().getFullYear();

  const [{ data: kategorier }, { data: transaksjoner }] = await Promise.all([
    supabase
      .from("budsjett_kategorier")
      .select("*")
      .eq("user_id", dataUserId)
      .eq("aktiv", true)
      .order("sortering"),
    supabase
      .from("transaksjoner")
      .select("*")
      .eq("user_id", dataUserId)
      .gte("dato", `${år}-01-01`)
      .lte("dato", `${år}-12-31`),
  ]);

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: "var(--font-lora)", color: "var(--text-primary)" }}>
            Forbrukslogg {år}
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Klikk et beløp for å se hva som ligger bak
          </p>
        </div>
        <RegistrerForbruk
          userId={dataUserId}
          kategorier={kategorier ?? []}
        />
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <ForbrukTabell
          kategorier={kategorier ?? []}
          transaksjoner={transaksjoner ?? []}
          år={år}
        />
      </div>
    </div>
  );
}
