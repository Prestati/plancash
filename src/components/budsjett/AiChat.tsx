"use client";

import { useState, useRef, useEffect } from "react";

interface Melding {
  fra: "bruker" | "ai";
  tekst: string;
}

const FORSLAG = [
  "Hva bruker jeg mest på?",
  "Har jeg råd til en ferie?",
  "Hvor mye har jeg til overs?",
  "Hva bør jeg kutte ned på?",
];

export default function AiChat({ navn }: { navn: string }) {
  const [åpen, setÅpen] = useState(false);
  const [meldinger, setMeldinger] = useState<Melding[]>([]);
  const [input, setInput] = useState("");
  const [laster, setLaster] = useState(false);
  const bunnenRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bunnenRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [meldinger, laster]);

  async function send(tekst?: string) {
    const spørsmål = (tekst ?? input).trim();
    if (!spørsmål || laster) return;
    setInput("");
    setMeldinger(prev => [...prev, { fra: "bruker", tekst: spørsmål }]);
    setLaster(true);

    const res = await fetch("/api/ai-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spørsmål }),
    });

    if (!res.ok || !res.body) {
      setMeldinger(prev => [...prev, { fra: "ai", tekst: "Beklager, noe gikk galt. Prøv igjen." }]);
      setLaster(false);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let svar = "";
    setMeldinger(prev => [...prev, { fra: "ai", tekst: "" }]);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      svar += decoder.decode(value, { stream: true });
      setMeldinger(prev => {
        const kopi = [...prev];
        kopi[kopi.length - 1] = { fra: "ai", tekst: svar };
        return kopi;
      });
    }
    setLaster(false);
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      {/* Header */}
      <button
        className="w-full flex items-center justify-between px-5 py-4"
        onClick={() => setÅpen(!åpen)}
        style={{ borderBottom: åpen ? "1px solid var(--border)" : "none" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base"
            style={{ background: "var(--accent-light)", color: "var(--accent)" }}>✦</div>
          <div className="text-left">
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Spør AI om økonomien din</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Analyserer dine egne tall</p>
          </div>
        </div>
        <span style={{ color: "var(--text-muted)" }}>{åpen ? "▲" : "▼"}</span>
      </button>

      {åpen && (
        <div>
          {/* Meldinger */}
          <div className="px-4 py-3 space-y-3" style={{ maxHeight: "340px", overflowY: "auto" }}>
            {meldinger.length === 0 && (
              <div className="space-y-2">
                <p className="text-xs text-center py-2" style={{ color: "var(--text-muted)" }}>
                  Hei {navn.split(" ")[0]}! Spør meg om budsjettet ditt 👇
                </p>
                <div className="flex flex-wrap gap-2">
                  {FORSLAG.map(f => (
                    <button key={f} onClick={() => send(f)}
                      className="text-xs px-3 py-1.5 rounded-full"
                      style={{ background: "var(--accent-light)", color: "var(--accent)", border: "1px solid var(--accent)" }}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {meldinger.map((m, i) => (
              <div key={i} className={`flex ${m.fra === "bruker" ? "justify-end" : "justify-start"}`}>
                <div
                  className="max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed"
                  style={{
                    background: m.fra === "bruker" ? "var(--accent)" : "var(--background)",
                    color: m.fra === "bruker" ? "white" : "var(--text-primary)",
                    borderBottomRightRadius: m.fra === "bruker" ? "4px" : undefined,
                    borderBottomLeftRadius: m.fra === "ai" ? "4px" : undefined,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {m.tekst || (m.fra === "ai" && laster ? <span className="animate-pulse">...</span> : "")}
                </div>
              </div>
            ))}

            {laster && meldinger[meldinger.length - 1]?.fra !== "ai" && (
              <div className="flex justify-start">
                <div className="px-3 py-2 rounded-2xl text-sm animate-pulse"
                  style={{ background: "var(--background)", color: "var(--text-muted)" }}>...</div>
              </div>
            )}
            <div ref={bunnenRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2 px-4 py-3" style={{ borderTop: "1px solid var(--border)" }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
              placeholder="Still et spørsmål..."
              disabled={laster}
              className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
              style={{
                background: "var(--background)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
                fontSize: "16px",
              }}
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || laster}
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-40"
              style={{ background: "var(--accent)", color: "white" }}
            >
              ↑
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
