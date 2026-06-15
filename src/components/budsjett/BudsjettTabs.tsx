"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function BudsjettTabsInner({ aktivFane, children }: { aktivFane: string; children: React.ReactNode[] }) {
  const router = useRouter();

  const tabs = [
    { id: "oppsett", label: "Budsjettoppsett" },
    { id: "betaling", label: "Månedsbetaling" },
  ];

  return (
    <div>
      {/* Tab-header */}
      <div className="flex gap-1 p-1 rounded-2xl mb-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => router.push(`/budsjett?fane=${tab.id}`)}
            className="flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: aktivFane === tab.id ? "var(--accent)" : "transparent",
              color: aktivFane === tab.id ? "white" : "var(--text-muted)",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Innhold */}
      {aktivFane === "oppsett" ? children[0] : children[1]}
    </div>
  );
}

export default function BudsjettTabs({ aktivFane, children }: { aktivFane: string; children: React.ReactNode[] }) {
  return (
    <Suspense>
      <BudsjettTabsInner aktivFane={aktivFane} children={children} />
    </Suspense>
  );
}
