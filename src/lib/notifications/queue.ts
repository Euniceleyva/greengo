import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { getSiteUrl } from "@/lib/payments/core";
import { buildEmail, type NotificationKind } from "@/lib/notifications/templates";
import { isEmailProviderConfigured, sendEmail } from "@/lib/notifications/resend-client";

type ReservationForNotification = {
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

const MAX_ATTEMPTS = 5;

/** Encola una notificación en `notification_deliveries`. No lanza: un fallo al
 * encolar no debe impedir que la reservación o el pago se registren. */
async function enqueue(
  reservationId: string,
  kind: NotificationKind,
  recipientEmail: string,
  paymentId?: string,
) {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("notification_deliveries").insert({
      reservation_id: reservationId,
      payment_id: paymentId ?? null,
      kind,
      recipient_email: recipientEmail.trim().toLowerCase(),
      status: "queued",
    });
    if (error) throw error;
  } catch (error) {
    console.error("No se pudo encolar la notificación", { kind, reservationId });
    void error;
  }
}

export async function enqueueReservationNotifications(reservation: ReservationForNotification) {
  await enqueue(reservation.id, "customer_confirmation", reservation.contact_email);
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL?.trim();
  if (adminEmail) await enqueue(reservation.id, "admin_new_reservation", adminEmail);
  await processNotificationQueue();
}

export async function enqueuePaymentNotification(
  reservationId: string,
  paymentId: string,
  recipientEmail: string,
  kind: Extract<NotificationKind, "payment_pending" | "payment_confirmed" | "payment_failed" | "refund">,
) {
  await enqueue(reservationId, kind, recipientEmail, paymentId);
  await processNotificationQueue();
}

/** Procesa hasta 20 notificaciones pendientes. Idempotente: cada fila se marca
 * `sent` una sola vez y los reintentos usan el mismo id, así que ejecutarlo en
 * paralelo o repetidamente no produce correos duplicados por fila. */
export async function processNotificationQueue() {
  if (!isEmailProviderConfigured()) return { processed: 0, skipped: true as const };

  const supabase = createAdminClient();
  const { data: pending, error } = await supabase
    .from("notification_deliveries")
    .select(
      "id, kind, recipient_email, attempts, reservation:reservations(id, folio, public_reference, contact_name, origin_name, destination_name, service_type, direction, origin_hotel_name, destination_hotel_name, service_date, pickup_time, return_date, return_time, passengers, vehicle_count, bags, flight_number, total_minor, currency, requires_quote)",
    )
    .in("status", ["queued", "failed"])
    .lt("attempts", MAX_ATTEMPTS)
    .order("created_at", { ascending: true })
    .limit(20);

  if (error) {
    console.error("No se pudo leer la cola de notificaciones", error.message);
    return { processed: 0, skipped: false as const };
  }

  let processed = 0;
  for (const row of pending ?? []) {
    const reservation = Array.isArray(row.reservation) ? row.reservation[0] : row.reservation;
    if (!reservation || !row.recipient_email) {
      await supabase
        .from("notification_deliveries")
        .update({ status: "skipped", last_error: "Sin reservación o destinatario asociado." })
        .eq("id", row.id);
      continue;
    }

    try {
      const template = buildEmail(row.kind as NotificationKind, {
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

      const result = await sendEmail({ to: row.recipient_email, subject: template.subject, html: template.html });

      await supabase
        .from("notification_deliveries")
        .update({
          status: "sent",
          provider: "resend",
          provider_message_id: result.providerMessageId,
          attempts: row.attempts + 1,
          sent_at: new Date().toISOString(),
          last_error: null,
        })
        .eq("id", row.id);
      processed += 1;
    } catch (sendError) {
      await supabase
        .from("notification_deliveries")
        .update({
          status: "failed",
          attempts: row.attempts + 1,
          last_error: sendError instanceof Error ? sendError.message.slice(0, 500) : "Error desconocido",
        })
        .eq("id", row.id);
    }
  }

  return { processed, skipped: false as const };
}
