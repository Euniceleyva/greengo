import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ServicesSummary } from "@/components/admon/services-summary";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Resumen de servicios",
  description: "Consulta sencilla de reservaciones e ingresos de GreenGo Transfers.",
  robots: { index: false, follow: false },
};

export default async function AdmonPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/admon/acceso");

  const { data: profile } = await supabase
    .from("app_users")
    .select("email, role, active")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile?.active || (profile.role !== "owner" && profile.role !== "admin")) {
    redirect("/admon/acceso?error=sin-acceso");
  }

  return (
    <main className="operations-theme min-h-screen bg-[radial-gradient(circle_at_top_right,hsl(var(--info)/0.16),transparent_34%),hsl(var(--background))]">
      <ServicesSummary adminEmail={profile.email} />
    </main>
  );
}
