"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Suspense } from "react";

function AksepterInvitasjon() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session && token) {
        subscription.unsubscribe();
        router.push(`/bli-med/${token}`);
      }
    });

    // Hvis allerede logget inn, gå rett til invitasjonen
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && token) {
        subscription.unsubscribe();
        router.push(`/bli-med/${token}`);
      }
    });

    return () => subscription.unsubscribe();
  }, [router, token]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl font-bold mx-auto mb-4"
          style={{ background: "var(--accent)" }}>₪</div>
        <p className="text-base font-medium" style={{ color: "var(--text-primary)" }}>Logger deg inn...</p>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Tar deg til invitasjonen</p>
      </div>
    </div>
  );
}

export default function AksepterPage() {
  return (
    <Suspense>
      <AksepterInvitasjon />
    </Suspense>
  );
}
