import { createClient } from "@/lib/supabase/server";
import { getDataUserId } from "@/lib/hushold";
import { redirect } from "next/navigation";
import PlancashDashboard from "@/components/budsjett/PlancashDashboard";
import Link from "next/link";

export default async function PlancashPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const dataUserId = await getDataUserId(user.id);

  const år = new Date().getFullYear();

  const [{ data: kategorier }, { data: avvik }] = await Promise.all([
    supabase
      .from("budsjett_kategorier")
      .select("*")
      .eq("user_id", dataUserId)
      .eq("aktiv", true)
      .order("type")
      .order("sortering"),
    supabase
      .from("budsjett_maneder")
      .select("*")
      .eq("user_id", dataUserId)
      .eq("ar", år),
  ]);

  const harKategorier = (kategorier ?? []).length > 0;

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: "var(--font-lora)", color: "var(--text-primary)" }}>
            Plancash
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Budsjett og økonomi for familien
          </p>
        </div>
        <Link
          href="/budsjett"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            color: "var(--text-secondary)",
          }}
        >
          ⚙ Rediger kategorier
        </Link>
      </div>

      {!harKategorier ? (
        <div
          className="rounded-2xl p-10 text-center"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div className="text-4xl mb-4">📋</div>
          <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-lora)", color: "var(--text-primary)" }}>
            Sett opp budsjettet ditt
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
            Legg inn inntekter, faste kostnader, lån og forbruk én gang — så er månedene klare.
          </p>
          <Link
            href="/budsjett"
            className="inline-block px-6 py-3 rounded-xl font-semibold text-white"
            style={{ background: "var(--accent)" }}
          >
            Start budsjettoppsett →
          </Link>
        </div>
      ) : (
        <PlancashDashboard
          userId={dataUserId}
          kategorier={kategorier ?? []}
          avvik={avvik ?? []}
          år={år}
        />
      )}
    </div>
  );
}
