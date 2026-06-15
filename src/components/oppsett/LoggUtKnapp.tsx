"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoggUtKnapp({ email }: { email: string }) {
  const router = useRouter();

  async function loggUt() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>{email}</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Innlogget konto</p>
        </div>
        <button
          onClick={loggUt}
          className="text-sm font-medium px-4 py-2 rounded-xl"
          style={{ background: "var(--red-light)", color: "var(--red)", border: "1px solid var(--red)" }}
        >
          Logg ut
        </button>
      </div>
    </div>
  );
}
