import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ServicesSummary, type AdminServiceRecord } from "@/components/admon/services-summary";
import { createClient } from "@/lib/supabase/server";
import { haversineKm } from "@/lib/geo";
import type { LatLng, PaymentStatus } from "@/types";

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

  const { data: reservations, error } = await supabase
    .from("reservations")
    .select(
      "id, folio, service_type, booking_source, status, contact_name, passengers, origin_name, origin_latitude, origin_longitude, destination_name, destination_latitude, destination_longitude, service_date, pickup_time, direction, total_minor, requires_quote, latest_payment_status",
    )
    .eq("booking_source", "web")
    .order("service_date", { ascending: false })
    .order("pickup_time", { ascending: false });

  if (error) console.error("Unable to load admin reservations", error);

  const trips: AdminServiceRecord[] = (reservations ?? []).map((reservation) => {
    const hasCoordinates =
      reservation.origin_latitude != null &&
      reservation.origin_longitude != null &&
      reservation.destination_latitude != null &&
      reservation.destination_longitude != null;
    const straightLineKm = hasCoordinates
      ? haversineKm(
          [Number(reservation.origin_latitude), Number(reservation.origin_longitude)] as LatLng,
          [Number(reservation.destination_latitude), Number(reservation.destination_longitude)] as LatLng,
        )
      : 0;
    const routeMultiplier = reservation.direction === "redondo" ? 2 : 1;
    const paymentStatus: PaymentStatus = reservation.requires_quote
      ? "cotizacion"
      : reservation.latest_payment_status === "approved"
        ? "pagado"
        : "pendiente";

    return {
      id: reservation.id,
      folio: reservation.folio,
      serviceType: reservation.service_type,
      bookingSource: reservation.booking_source,
      client: reservation.contact_name,
      passengers: reservation.passengers,
      origin: reservation.origin_name,
      destination: reservation.destination_name,
      date: reservation.service_date,
      time: String(reservation.pickup_time).slice(0, 5),
      amount: Number(reservation.total_minor) / 100,
      paymentStatus,
      status:
        reservation.status === "cancelled"
          ? "cancelado"
          : reservation.status === "confirmed"
            ? "confirmado"
            : "pendiente",
      plannedKm: Math.round(straightLineKm * 1.25 * routeMultiplier * 10) / 10,
    };
  });

  return (
    <main className="operations-theme min-h-screen bg-[radial-gradient(circle_at_top_right,hsl(var(--info)/0.16),transparent_34%),hsl(var(--background))]">
      <ServicesSummary adminEmail={profile.email} trips={trips} />
    </main>
  );
}
