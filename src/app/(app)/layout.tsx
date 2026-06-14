import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar user={user} />
      </div>

      {/* Innhold */}
      <main className="md:ml-60 p-4 md:p-8 pb-24 md:pb-8 max-w-5xl">
        {children}
      </main>

      {/* Mobil bunn-nav */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
