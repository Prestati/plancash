"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthHashHandler() {
  const router = useRouter();

  useEffect(() => {
    if (!window.location.hash.includes("type=recovery")) return;

    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        subscription.unsubscribe();
        router.push("/auth/reset-passord");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return null;
}
