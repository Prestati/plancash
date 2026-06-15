import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");
  const tokenHash = searchParams.get("token_hash");

  const supabase = await createClient();

  // Gammel format: token_hash + type=recovery
  if (tokenHash && type === "recovery") {
    await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" });
    return NextResponse.redirect(`${origin}/auth/reset-passord`);
  }

  // Ny PKCE-format: code (kan være recovery eller login)
  if (code) {
    const { data } = await supabase.auth.exchangeCodeForSession(code);
    // Hvis det er en recovery-sesjon, send til reset-passord-siden
    if (data?.session?.user?.recovery_sent_at) {
      return NextResponse.redirect(`${origin}/auth/reset-passord`);
    }
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
