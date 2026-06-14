import { createClient } from "@/lib/supabase/server";

// Returnerer user_id-en som skal brukes for dataspørringer.
// Hvis brukeren er et familiemedlem i noens hushold, returneres eierens ID.
export async function getDataUserId(authUserId: string): Promise<string> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("hushold_tilgang")
    .select("eier_user_id")
    .eq("medlem_user_id", authUserId)
    .single();
  return data?.eier_user_id ?? authUserId;
}
