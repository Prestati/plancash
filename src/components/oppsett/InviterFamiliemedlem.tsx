"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function InviterFamiliemedlem({ userId }: { userId: string }) {
  const [epost, setEpost] = useState("");
  const [status, setStatus] = useState<"idle" | "sender" | "sendt" | "feil">("idle");
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  async function sendInvitasjon() {
    if (!epost.trim()) return;
    setStatus("sender");

    const res = await fetch("/api/inviter-familiemedlem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ epost: epost.trim() }),
    });

    const json = await res.json();

    if (!res.ok) {
      setStatus("feil");
      return;
    }

    if (json.link) setInviteLink(json.link);
    setStatus("sendt");
    setEpost("");
  }

  return (
    <div className="rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <h3 className="font-bold mb-1" style={{ fontFamily: "var(--font-lora)", color: "var(--text-primary)" }}>
        Inviter familiemedlem
      </h3>
      <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
        Del tilgang til budsjettet med en annen person
      </p>

      {status !== "sendt" ? (
        <div className="flex gap-2">
          <input
            type="email"
            value={epost}
            onChange={(e) => setEpost(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendInvitasjon()}
            placeholder="tobias@example.com"
            className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: "var(--background)", border: "1.5px solid var(--border)", color: "var(--text-primary)" }}
            onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
          <button
            onClick={sendInvitasjon}
            disabled={!epost.trim() || status === "sender"}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40"
            style={{ background: "var(--accent)" }}
          >
            {status === "sender" ? "Sender..." : "Inviter"}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="p-3 rounded-xl text-sm" style={{ background: "var(--green-light)", color: "var(--green)" }}>
            ✓ Invitasjon klar! Del lenken under på SMS eller lignende.
          </div>
          {inviteLink && <div>
            <p className="text-xs mb-1.5 font-medium" style={{ color: "var(--text-muted)" }}>
              Send denne lenken til familiemedlemmet:
            </p>
            <div className="flex gap-2">
              <input
                readOnly
                value={inviteLink ?? ""}
                className="flex-1 px-3 py-2 rounded-xl text-xs outline-none"
                style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
              />
              <button
                onClick={() => navigator.clipboard.writeText(inviteLink ?? "")}
                className="px-3 py-2 rounded-xl text-xs font-medium"
                style={{ background: "var(--accent-light)", color: "var(--accent)" }}
              >
                Kopier
              </button>
            </div>
          </div>}
          <button
            onClick={() => { setStatus("idle"); setInviteLink(null); }}
            className="text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            Inviter en til
          </button>
        </div>
      )}

      {status === "feil" && (
        <p className="text-xs mt-2" style={{ color: "var(--red)" }}>
          Noe gikk galt — prøv igjen.
        </p>
      )}
    </div>
  );
}
