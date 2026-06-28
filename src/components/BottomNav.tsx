"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/dashboard", icon: "⌂", label: "Hjem" },
  { href: "/forbruk", icon: "🛒", label: "Forbruk" },
  { href: "/budsjett", icon: "📋", label: "Budsjett" },
  { href: "/gjeld", icon: "💳", label: "Gjeld", beta: true },
  { href: "/oppsett", icon: "⚙", label: "Innst." },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 pb-safe"
      style={{
        background: "var(--surface)",
        borderTop: "1px solid var(--border)",
        paddingTop: "8px",
        paddingBottom: "max(8px, env(safe-area-inset-bottom))",
      }}
    >
      {nav.map((item) => {
        const aktiv = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className="relative flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all"
            style={{
              color: aktiv ? "var(--accent)" : "var(--text-muted)",
              fontWeight: aktiv ? 600 : 400,
            }}
          >
            <span className="text-xl leading-none">{item.icon}</span>
            <span className="text-xs leading-none flex items-center gap-0.5">
              {item.label}
              {"beta" in item && item.beta && (
                <span className="text-[8px] font-bold px-0.5 rounded" style={{ background: "var(--amber)", color: "white", lineHeight: "1.2" }}>β</span>
              )}
            </span>
            {aktiv && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ background: "var(--accent)" }} />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
