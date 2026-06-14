"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/dashboard";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setMessage("Sjekk e-posten din for bekreftelseslenke!");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else router.push(redirectTo);
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "var(--background)" }}>
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-8">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-base"
          style={{ background: "var(--accent)" }}
        >
          ₪
        </div>
        <span className="text-xl font-bold" style={{ fontFamily: "var(--font-lora)", color: "var(--text-primary)" }}>
          Plancash
        </span>
      </Link>

      <div
        className="w-full max-w-sm rounded-2xl p-8 shadow-sm"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-lora)", color: "var(--text-primary)" }}>
          {isSignUp ? "Opprett konto" : "Logg inn"}
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
          {isSignUp ? "Bli med i Plan-familien" : "Velkommen tilbake"}
        </p>

        {message && (
          <div className="mb-4 p-3 rounded-xl text-sm" style={{ background: "var(--green-light)", color: "var(--green)" }}>
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 rounded-xl text-sm" style={{ background: "var(--red-light)", color: "var(--red)" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              E-post
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="deg@eksempel.no"
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
              style={{
                background: "var(--background)",
                border: "1.5px solid var(--border)",
                color: "var(--text-primary)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Passord
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
              style={{
                background: "var(--background)",
                border: "1.5px solid var(--border)",
                color: "var(--text-primary)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl font-semibold text-sm text-white transition-opacity disabled:opacity-50"
            style={{ background: "var(--accent)" }}
          >
            {loading ? "Laster..." : isSignUp ? "Opprett konto" : "Logg inn"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm" style={{ color: "var(--text-muted)" }}>
          {isSignUp ? "Har du allerede konto?" : "Ny bruker?"}{" "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="font-semibold underline underline-offset-2"
            style={{ color: "var(--accent)" }}
          >
            {isSignUp ? "Logg inn" : "Opprett konto"}
          </button>
        </p>
      </div>
    </div>
  );
}
