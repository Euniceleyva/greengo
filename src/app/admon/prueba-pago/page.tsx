import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LivePaymentTest } from "./live-payment-test";

export const metadata: Metadata = {
  title: "Prueba privada de pago",
  description: "Prueba productiva restringida para administración.",
  robots: { index: false, follow: false },
};

export default async function LivePaymentTestPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
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

  const query = await searchParams;
  const reference = typeof query.reference === "string" ? query.reference : undefined;
  const paymentReturn = typeof query.return === "string" ? query.return : undefined;

  return (
    <LivePaymentTest
      adminEmail={profile.email}
      paymentReference={reference}
      paymentReturn={paymentReturn}
    />
  );
}
