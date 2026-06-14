import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");
  const tokenHash = searchParams.get("token_hash");

  const supabase = await createClient();

  if (tokenHash && type === "recovery") {
    await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" });
    return NextResponse.redirect(`${origin}/auth/reset-passord`);
  }

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
