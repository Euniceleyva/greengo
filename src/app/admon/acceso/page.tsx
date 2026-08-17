import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Acceso administrativo",
  description: "Acceso privado al control de reservaciones de GreenGo Transfers.",
  robots: { index: false, follow: false },
};

export default async function AdmonLoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("app_users")
      .select("role, active")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profile?.active && (profile.role === "owner" || profile.role === "admin")) {
      redirect("/admon");
    }
  }

  return <LoginForm accessDenied={params?.error === "sin-acceso"} />;
}
