import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { getSiteUrl } from "@/lib/payments/core";
import { buildReservationEmail } from "@/lib/notifications/templates";
import { isEmailProviderConfigured, sendEmail } from "@/lib/notifications/resend-client";

export type ReservationForNotification = {
  id: string;
  folio: string;
  public_reference: string;
  contact_name: string;
  contact_email: string;
  origin_name: string;
  destination_name: string;
  service_type: string;
  direction: string;
  origin_hotel_name: string | null;
  destination_hotel_name: string | null;
  service_date: string;
  pickup_time: string;
  return_date: string | null;
  return_time: string | null;
  passengers: number;
  vehicle_count: number;
  bags: number;
  flight_number: string | null;
  total_minor: number | string;
  currency: string;
  requires_quote: boolean;
};

export async function enqueueReservationConfirmation(reservation: ReservationForNotification) {
  const supabase = createAdminClient();
  const recipientEmail = reservation.contact_email.trim().toLowerCase();
  const { data: delivery, error } = await supabase
    .from("notification_deliveries")
    .insert({
      reservation_id: reservation.id,
      kind: "customer_confirmation",
      recipient_email: recipientEmail,
      status: "queued",
    })
    .select("id")
    .single();

  if (error) {
    console.error("No se pudo encolar el comprobante", { reservationId: reservation.id });
    return;
  }
  if (!isEmailProviderConfigured()) return;

  try {
    const template = buildReservationEmail({
      folio: reservation.folio,
      publicReference: reservation.public_reference,
      contactName: reservation.contact_name,
      originName: reservation.origin_name,
      destinationName: reservation.destination_name,
      serviceType: reservation.service_type,
      direction: reservation.direction,
      originHotelName: reservation.origin_hotel_name,
      destinationHotelName: reservation.destination_hotel_name,
      serviceDate: reservation.service_date,
      pickupTime: reservation.pickup_time,
      returnDate: reservation.return_date,
      returnTime: reservation.return_time,
      passengers: reservation.passengers,
      vehicleCount: reservation.vehicle_count,
      bags: reservation.bags,
      flightNumber: reservation.flight_number,
      amountFormatted: `${(Number(reservation.total_minor) / 100).toFixed(2)} ${reservation.currency}`,
      requiresQuote: reservation.requires_quote,
      siteUrl: getSiteUrl(),
    });
    const sent = await sendEmail({ to: recipientEmail, ...template });
    await supabase.from("notification_deliveries").update({
      status: "sent",
      provider: "resend",
      provider_message_id: sent.providerMessageId,
      attempts: 1,
      sent_at: new Date().toISOString(),
      last_error: null,
    }).eq("id", delivery.id);
  } catch (sendError) {
    await supabase.from("notification_deliveries").update({
      status: "failed",
      attempts: 1,
      last_error: sendError instanceof Error ? sendError.message.slice(0, 500) : "Error desconocido",
    }).eq("id", delivery.id);
  }
}
