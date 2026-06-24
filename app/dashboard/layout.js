import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TopBar from "@/components/TopBar";

export default async function DashboardLayout({ children }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen">
      <TopBar phone={user.phone || user.email || "You"} />
      <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6 sm:px-6">
        {children}
      </main>
    </div>
  );
}
