import Link from "next/link";

export default function Home() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: "var(--background)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10">
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

      {/* Kommer snart */}
      <div className="text-center max-w-md">
        <div
          className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-6"
          style={{ background: "var(--accent-light)", color: "var(--accent)" }}
        >
          Kommer snart
        </div>
        <h2
          className="text-3xl font-bold mb-4 leading-snug"
          style={{ fontFamily: "var(--font-lora)", color: "var(--text-primary)" }}
        >
          Familieøkonomi gjort enkelt
        </h2>
        <p className="text-base leading-relaxed mb-10" style={{ color: "var(--text-secondary)" }}>
          Én oversikt over budsjett, utgifter og sparing — for hele familien.
          Del med partneren, logg kvitteringer og få smarte innsikter.
        </p>

        {/* Funksjoner */}
        <div className="grid grid-cols-2 gap-3 mb-10 text-left">
          {[
            { ikon: "📊", tekst: "Budsjett & årsplan" },
            { ikon: "🧾", tekst: "Scan kvitteringer" },
            { ikon: "✨", tekst: "AI-innsikt" },
            { ikon: "👨‍👩‍👧", tekst: "Del med familien" },
          ].map(({ ikon, tekst }) => (
            <div
              key={tekst}
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
            >
              <span>{ikon}</span>
              <span>{tekst}</span>
            </div>
          ))}
        </div>

        <p className="text-sm mb-3" style={{ color: "var(--text-muted)" }}>
          Allerede bruker?
        </p>
        <Link
          href="/auth/login"
          className="inline-block px-8 py-3 rounded-xl font-semibold text-white text-sm transition-opacity hover:opacity-90"
          style={{ background: "var(--accent)" }}
        >
          Logg inn →
        </Link>
      </div>

      <p className="mt-16 text-xs" style={{ color: "var(--text-muted)" }}>
        En del av{" "}
        <a href="https://www.plandish.no" className="underline underline-offset-2">
          Plan-familien
        </a>
      </p>
    </div>
  );
}
