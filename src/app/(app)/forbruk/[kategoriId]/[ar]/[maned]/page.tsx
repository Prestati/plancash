import { createClient } from "@/lib/supabase/server";
import { getDataUserId } from "@/lib/hushold";
import { MÅNEDER } from "@/lib/budsjett";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ForbrukDetaljPage({
  params,
}: {
  params: Promise<{ kategoriId: string; ar: string; maned: string }>;
}) {
  const { kategoriId, ar, maned } = await params;
  const år = Number(ar);
  const manadNr = Number(maned);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const dataUserId = await getDataUserId(user.id);

  const manadStr = String(manadNr).padStart(2, "0");

  const [{ data: kategori }, { data: transaksjoner }] = await Promise.all([
    supabase
      .from("budsjett_kategorier")
      .select("*")
      .eq("id", kategoriId)
      .single(),
    supabase
      .from("transaksjoner")
      .select("*")
      .eq("user_id", dataUserId)
      .eq("kategori", kategoriId)
      .gte("dato", `${år}-${manadStr}-01`)
      .lte("dato", `${år}-${manadStr}-31`)
      .order("dato", { ascending: false }),
  ]);

  const total = (transaksjoner ?? []).reduce((s, t) => s + t.beløp, 0);

  // Grupper beskrivelser for innsikt
  const beskrivelseFrekvens: Record<string, number> = {};
  for (const t of transaksjoner ?? []) {
    if (t.beskrivelse) {
      const nøkkel = t.beskrivelse.toLowerCase().trim();
      beskrivelseFrekvens[nøkkel] = (beskrivelseFrekvens[nøkkel] ?? 0) + 1;
    }
  }
  const hyppige = Object.entries(beskrivelseFrekvens)
    .filter(([, antall]) => antall > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link
          href="/forbruk"
          className="text-sm mb-4 inline-flex items-center gap-1"
          style={{ color: "var(--text-muted)" }}
        >
          ← Forbrukslogg
        </Link>
        <h1 className="text-3xl font-bold mb-1 mt-2" style={{ fontFamily: "var(--font-lora)", color: "var(--text-primary)" }}>
          {kategori?.navn ?? "Kategori"}
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          {MÅNEDER[manadNr - 1]} {år}
        </p>
      </div>

      {/* Total */}
      <div
        className="rounded-2xl p-6 mb-6 flex items-center justify-between"
        style={{ background: "var(--red-light)", border: "1px solid var(--red)" }}
      >
        <div>
          <p className="text-sm font-medium mb-1" style={{ color: "var(--red)" }}>Totalt registrert</p>
          <p className="text-4xl font-bold" style={{ fontFamily: "var(--font-lora)", color: "var(--red)" }}>
            {total.toLocaleString("nb-NO")} kr
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {transaksjoner?.length ?? 0} poster
          </p>
        </div>
      </div>

      {/* Hyppige beskrivelser */}
      {hyppige.length > 0 && (
        <div
          className="rounded-2xl p-5 mb-6"
          style={{ background: "var(--accent-light)", border: "1.5px solid var(--accent)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span>✨</span>
            <span className="text-sm font-bold" style={{ color: "var(--accent)", fontFamily: "var(--font-lora)" }}>
              Innsikt
            </span>
          </div>
          <div className="space-y-1.5">
            {hyppige.map(([beskrivelse, antall]) => (
              <p key={beskrivelse} className="text-sm" style={{ color: "var(--text-primary)" }}>
                💡 <span className="font-medium capitalize">{beskrivelse}</span> dukker opp {antall} ganger denne måneden
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Transaksjonsliste */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div
          className="px-5 py-3 text-xs font-semibold uppercase tracking-wider grid"
          style={{
            gridTemplateColumns: "1fr 120px 100px",
            background: "var(--background)",
            color: "var(--text-muted)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div>Beskrivelse</div>
          <div>Hvem</div>
          <div className="text-right">Beløp</div>
        </div>

        {(transaksjoner ?? []).length === 0 && (
          <div className="px-5 py-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>
            Ingen registrerte poster
          </div>
        )}

        {(transaksjoner ?? []).map((t, idx) => (
          <div
            key={t.id}
            className="grid items-center px-5 py-3.5"
            style={{
              gridTemplateColumns: "1fr 120px 100px",
              borderBottom: idx < (transaksjoner?.length ?? 0) - 1 ? "1px solid var(--border)" : "none",
            }}
          >
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                {t.beskrivelse || <span style={{ color: "var(--text-muted)" }}>—</span>}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                {new Date(t.dato).toLocaleDateString("nb-NO", { day: "numeric", month: "long" })}
              </p>
            </div>
            <div>
              {t.betalt_av && t.betalt_av !== "felles" ? (
                <span
                  className="text-xs px-2 py-1 rounded-full font-medium"
                  style={{ background: "var(--accent-light)", color: "var(--accent)" }}
                >
                  {t.betalt_av}
                </span>
              ) : (
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>Felles</span>
              )}
            </div>
            <div className="text-right font-semibold text-sm" style={{ color: "var(--red)" }}>
              {t.beløp.toLocaleString("nb-NO")} kr
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
