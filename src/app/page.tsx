import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
      <div className="text-center px-6">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl font-bold"
            style={{ background: "var(--accent)" }}
          >
            ₪
          </div>
          <h1 className="text-4xl font-bold" style={{ fontFamily: "var(--font-lora)", color: "var(--text-primary)" }}>
            Plancash
          </h1>
        </div>
        <p className="mb-8 max-w-sm mx-auto" style={{ color: "var(--text-secondary)" }}>
          Én oversikt over familieøkonomien — budsjett, utgifter og SIFO-referansetall
        </p>
        <Link
          href="/auth/login"
          className="inline-block px-8 py-3 rounded-xl font-semibold text-white transition-colors"
          style={{ background: "var(--accent)" }}
        >
          Kom i gang
        </Link>
        <p className="mt-4 text-sm" style={{ color: "var(--text-muted)" }}>
          En del av{" "}
          <a href="https://www.plandish.no" className="underline underline-offset-2">
            Plan-familien
          </a>
        </p>
      </div>
    </div>
  );
}
