import Link from "next/link";

export default function Home() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--background)" }}
    >
      {/* Hero */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-10 text-center"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-sm"
            style={{ background: "var(--accent)" }}
          >
            ₪
          </div>
          <h1
            className="text-4xl font-bold"
            style={{ fontFamily: "var(--font-lora)", color: "var(--text-primary)" }}
          >
            Plancash
          </h1>
        </div>

        {/* Badge */}
        <div
          className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-6"
          style={{ background: "var(--accent-light)", color: "var(--accent)" }}
        >
          Kommer snart
        </div>

        {/* Tagline */}
        <h2
          className="text-2xl font-bold mb-4 leading-snug max-w-xs"
          style={{ fontFamily: "var(--font-lora)", color: "var(--text-primary)" }}
        >
          Familieøkonomi<br />gjort enkelt
        </h2>
        <p
          className="text-base leading-relaxed mb-10 max-w-xs"
          style={{ color: "var(--text-secondary)" }}
        >
          Budsjett, utgifter og sparing — én oversikt for hele familien.
        </p>

        {/* Feature-kort */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-sm mb-10 text-left">
          {[
            { ikon: "📊", tekst: "Budsjett & årsplan" },
            { ikon: "🧾", tekst: "Logg kvitteringer" },
            { ikon: "✨", tekst: "Innsikt" },
            { ikon: "👨‍👩‍👧", tekst: "Del med familien" },
          ].map(({ ikon, tekst }) => (
            <div
              key={tekst}
              className="flex items-center gap-2.5 px-4 py-3.5 rounded-2xl text-sm font-medium"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--text-secondary)",
              }}
            >
              <span className="text-lg">{ikon}</span>
              <span>{tekst}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link
          href="/auth/login"
          className="w-full max-w-sm flex items-center justify-center py-4 rounded-2xl font-semibold text-white text-base transition-opacity active:opacity-80"
          style={{ background: "var(--accent)" }}
        >
          Logg inn →
        </Link>
      </div>

      {/* Footer */}
      <div className="py-6 text-center">
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          En del av{" "}
          <a href="https://www.plandish.no" className="underline underline-offset-2">
            Plan-familien
          </a>
        </p>
      </div>
    </div>
  );
}
