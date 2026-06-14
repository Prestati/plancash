"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/dashboard", icon: "⌂", label: "Hjem" },
  { href: "/forbruk", icon: "🛒", label: "Forbruk" },
  { href: "/budsjett", icon: "📋", label: "Budsjett" },
  { href: "/plancash", icon: "₪", label: "Oversikt" },
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
            className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all"
            style={{
              color: aktiv ? "var(--accent)" : "var(--text-muted)",
              fontWeight: aktiv ? 600 : 400,
            }}
          >
            <span className="text-xl leading-none">{item.icon}</span>
            <span className="text-xs">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
