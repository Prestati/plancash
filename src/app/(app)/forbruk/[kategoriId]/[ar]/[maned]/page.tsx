import { createClient } from "@/lib/supabase/server";
import { getDataUserId } from "@/lib/hushold";
import { MÅNEDER } from "@/lib/budsjett";
import { redirect } from "next/navigation";
import Link from "next/link";
import ForbrukAiInnsikt from "@/components/budsjett/ForbrukAiInnsikt";
import ForbrukTransaksjonsListe from "@/components/budsjett/ForbrukTransaksjonsListe";

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
      .lt("dato", manadNr === 12 ? `${år + 1}-01-01` : `${år}-${String(manadNr + 1).padStart(2, "0")}-01`)
      .order("dato", { ascending: false }),
  ]);

  const total = (transaksjoner ?? []).reduce((s, t) => s + t.beløp, 0);

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

      {/* AI-innsikt */}
      {(transaksjoner ?? []).length > 0 && (
        <ForbrukAiInnsikt
          transaksjoner={(transaksjoner ?? []).map(t => ({
            beskrivelse: t.beskrivelse,
            beløp: t.beløp,
            dato: t.dato,
          }))}
          kategoriNavn={kategori?.navn ?? kategoriId}
          maaned={`${MÅNEDER[manadNr - 1]} ${år}`}
        />
      )}

      {/* Transaksjonsliste — redigerbar */}
      <ForbrukTransaksjonsListe transaksjoner={transaksjoner ?? []} />
    </div>
  );
}
