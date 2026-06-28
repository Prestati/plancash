"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const modules = [
  { name: "Hjem", href: "/dashboard", icon: "⌂", active: true },
  { name: "Månedsbetaling", href: "/maaned", icon: "✓", active: true },
  { name: "Forbrukslogg", href: "/forbruk", icon: "🛒", active: true },
  { name: "Budsjettoppsett", href: "/budsjett", icon: "📋", active: true },
  { name: "Plancash", href: "/plancash", icon: "₪", active: true },
  { name: "Gjeldsplan", href: "/gjeld", icon: "💳", active: true, beta: true },
  { name: "Plandish", href: "https://www.plandish.no", icon: "🛒", active: true, extern: true },
];

const innstillinger = [
  { name: "Hushold & SIFO", href: "/oppsett", icon: "👥" },
];

export default function Sidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  return (
    <aside
      className="fixed left-0 top-0 h-full w-60 flex flex-col"
      style={{ background: "var(--surface)", borderRight: "1px solid var(--border)" }}
    >
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-2.5" style={{ borderBottom: "1px solid var(--border)" }}>
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-sm"
          style={{ background: "var(--accent)" }}
        >
          ₪
        </div>
        <div>
          <p className="font-bold text-base leading-tight" style={{ fontFamily: "var(--font-lora)", color: "var(--text-primary)" }}>
            Plancash
          </p>
          <p className="text-xs leading-tight" style={{ color: "var(--text-muted)" }}>Plan-familien</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        <p className="text-xs font-semibold uppercase tracking-wider px-3 pt-2 pb-1" style={{ color: "var(--text-muted)" }}>
          Moduler
        </p>
        {modules.map((mod) => {
          const isActive = !mod.extern && pathname.startsWith(mod.href);
          return (
            <Link
              key={mod.name}
              href={mod.active ? mod.href : "#"}
              target={mod.extern ? "_blank" : undefined}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors"
              style={{
                background: isActive ? "var(--accent-light)" : "transparent",
                color: isActive
                  ? "var(--accent)"
                  : mod.active
                  ? "var(--text-secondary)"
                  : "var(--text-muted)",
                fontWeight: isActive ? 600 : 400,
                cursor: mod.active ? "pointer" : "not-allowed",
              }}
            >
              <span className="text-base">{mod.icon}</span>
              <span>{mod.name}</span>
              {"beta" in mod && mod.beta && (
                <span className="ml-1 text-[9px] font-bold px-1 py-0.5 rounded" style={{ background: "var(--amber)", color: "white" }}>BETA</span>
              )}
              {mod.extern && (
                <span className="ml-auto text-xs" style={{ color: "var(--text-muted)" }}>↗</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Innstillinger */}
      <div className="px-3 pb-2">
        <p className="text-xs font-semibold uppercase tracking-wider px-3 pt-2 pb-1" style={{ color: "var(--text-muted)" }}>
          Innstillinger
        </p>
        {innstillinger.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors"
              style={{
                background: isActive ? "var(--accent-light)" : "transparent",
                color: isActive ? "var(--accent)" : "var(--text-secondary)",
                fontWeight: isActive ? 600 : 400,
              }}
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Bruker */}
      <div className="p-4" style={{ borderTop: "1px solid var(--border)" }}>
        <p className="text-xs truncate mb-2" style={{ color: "var(--text-muted)" }}>{user.email}</p>
        <button
          onClick={signOut}
          className="text-sm transition-colors"
          style={{ color: "var(--text-secondary)" }}
          onMouseOver={(e) => (e.currentTarget.style.color = "var(--red)")}
          onMouseOut={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
        >
          Logg ut
        </button>
      </div>
    </aside>
  );
}
