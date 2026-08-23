import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { enqueuePaymentNotification } from "@/lib/notifications/queue";
import type { NotificationKind } from "@/lib/notifications/templates";

export type PaymentProvider = "mercado_pago" | "paypal";
export type PaymentMethod = "card" | "oxxo" | "spei" | "paypal";
export type PaymentStatus =
  | "created"
  | "pending"
  | "action_required"
  | "approved"
  | "rejected"
  | "cancelled"
  | "expired"
  | "refunded"
  | "charged_back";

export type PayableReservation = {
  id: string;
  folio: string;
  public_reference: string;
  status: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  origin_name: string;
  destination_name: string;
  service_date: string;
  pickup_time: string;
  total_minor: number | string;
  currency: string;
  requires_quote: boolean;
};

export type PaymentAttempt = {
  id: string;
  reservation_id: string;
  provider: PaymentProvider;
  method: PaymentMethod;
  status: PaymentStatus;
  amount_minor: number | string;
  currency: string;
  external_reference: string;
  idempotency_key: string;
  provider_order_id: string | null;
  provider_payment_id: string | null;
  checkout_url: string | null;
};

export function getSiteUrl() {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "https://www.greengotransferscancun.com";

  const url = new URL(configured);
  if (url.protocol !== "https:" && url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
    throw new Error("NEXT_PUBLIC_SITE_URL debe usar HTTPS.");
  }

  return url.origin;
}

export function minorToDecimal(amountMinor: number | string) {
  return (Number(amountMinor) / 100).toFixed(2);
}

export async function getPayableReservation(publicReference: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("reservations")
    .select(
      "id, folio, public_reference, status, contact_name, contact_email, contact_phone, origin_name, destination_name, service_date, pickup_time, total_minor, currency, requires_quote",
    )
    .eq("public_reference", publicReference)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new PaymentRequestError("No encontramos la reservación.", 404);

  const reservation = data as PayableReservation;
  if (reservation.requires_quote || Number(reservation.total_minor) <= 0) {
    throw new PaymentRequestError("La reservación todavía requiere una tarifa aprobada.", 409);
  }
  if (["cancelled", "expired", "refunded"].includes(reservation.status)) {
    throw new PaymentRequestError("La reservación ya no admite pagos.", 409);
  }

  return reservation;
}

export async function getOrCreatePaymentAttempt(
  reservation: PayableReservation,
  provider: PaymentProvider,
  method: PaymentMethod,
) {
  const supabase = createAdminClient();
  const externalReference = `${provider}:${reservation.public_reference}`;
  const { data: existing, error: existingError } = await supabase
    .from("payments")
    .select(
      "id, reservation_id, provider, method, status, amount_minor, currency, external_reference, idempotency_key, provider_order_id, provider_payment_id, checkout_url",
    )
    .eq("external_reference", externalReference)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing) return existing as PaymentAttempt;

  const { data, error } = await supabase
    .from("payments")
    .insert({
      reservation_id: reservation.id,
      provider,
      method,
      status: "created",
      amount_minor: Number(reservation.total_minor),
      currency: reservation.currency,
      external_reference: externalReference,
      metadata: { reservation_folio: reservation.folio },
    })
    .select(
      "id, reservation_id, provider, method, status, amount_minor, currency, external_reference, idempotency_key, provider_order_id, provider_payment_id, checkout_url",
    )
    .single();

  if (error?.code === "23505") {
    return getOrCreatePaymentAttempt(reservation, provider, method);
  }
  if (error) throw error;
  return data as PaymentAttempt;
}

export async function updatePaymentAttempt(id: string, patch: Record<string, unknown>) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("payments").update(patch).eq("id", id);
  if (error) throw error;
}

export async function applyProviderPayment(input: {
  provider: PaymentProvider;
  externalReference?: string | null;
  providerOrderId?: string | null;
  providerPaymentId?: string | null;
  status: PaymentStatus;
  method: PaymentMethod;
  statusDetail?: string | null;
  paidAt?: string | null;
  amountMinor?: number | null;
  currency?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const supabase = createAdminClient();
  let query = supabase
    .from("payments")
    .select("id, reservation_id, amount_minor, currency, status")
    .eq("provider", input.provider);

  if (input.externalReference) query = query.eq("external_reference", input.externalReference);
  else if (input.providerOrderId) query = query.eq("provider_order_id", input.providerOrderId);
  else if (input.providerPaymentId) query = query.eq("provider_payment_id", input.providerPaymentId);
  else throw new Error("El evento del proveedor no contiene una referencia conciliable.");

  const { data: payment, error: paymentError } = await query.maybeSingle();
  if (paymentError) throw paymentError;
  if (!payment) throw new Error("No existe un intento de pago para el evento recibido.");

  const nonFinalStatuses: PaymentStatus[] = [
    "created",
    "pending",
    "action_required",
    "rejected",
    "cancelled",
    "expired",
  ];
  if (
    (payment.status === "approved" && nonFinalStatuses.includes(input.status)) ||
    (["refunded", "charged_back"].includes(payment.status) && payment.status !== input.status)
  ) {
    return payment.id as string;
  }

  if (input.status === "approved") {
    if (input.amountMinor == null || Number(payment.amount_minor) !== input.amountMinor) {
      throw new Error("El importe confirmado por el proveedor no coincide con la reservación.");
    }
    if (!input.currency || payment.currency !== input.currency.toUpperCase()) {
      throw new Error("La moneda confirmada por el proveedor no coincide con la reservación.");
    }
  }

  const now = new Date().toISOString();
  const { error: updatePaymentError } = await supabase
    .from("payments")
    .update({
      status: input.status,
      method: input.method,
      provider_order_id: input.providerOrderId ?? undefined,
      provider_payment_id: input.providerPaymentId ?? undefined,
      provider_status_detail: input.statusDetail ?? null,
      paid_at: input.status === "approved" ? input.paidAt ?? now : undefined,
      metadata: input.metadata ?? {},
    })
    .eq("id", payment.id);
  if (updatePaymentError) throw updatePaymentError;

  const reservationPatch: Record<string, unknown> = {
    latest_payment_status: input.status,
    latest_payment_method: input.method,
  };
  if (input.status === "approved") {
    reservationPatch.status = "confirmed";
    reservationPatch.confirmed_at = input.paidAt ?? now;
  } else if (["created", "pending", "action_required"].includes(input.status)) {
    reservationPatch.status = "payment_pending";
  } else if (input.status === "refunded" || input.status === "charged_back") {
    reservationPatch.status = "refunded";
  } else if (["rejected", "cancelled", "expired"].includes(input.status)) {
    reservationPatch.status = "awaiting_payment";
  }

  const { error: reservationError } = await supabase
    .from("reservations")
    .update(reservationPatch)
    .eq("id", payment.reservation_id);
  if (reservationError) throw reservationError;

  await notifyPaymentOutcome(supabase, payment.reservation_id, payment.id as string, input.status);

  return payment.id as string;
}

async function notifyPaymentOutcome(
  supabase: ReturnType<typeof createAdminClient>,
  reservationId: string,
  paymentId: string,
  status: PaymentStatus,
) {
  const kind: Extract<NotificationKind, "payment_pending" | "payment_confirmed" | "payment_failed" | "refund"> | null =
    status === "approved"
      ? "payment_confirmed"
      : ["created", "pending", "action_required"].includes(status)
        ? "payment_pending"
        : ["rejected", "cancelled", "expired"].includes(status)
          ? "payment_failed"
          : status === "refunded" || status === "charged_back"
            ? "refund"
            : null;
  if (!kind) return;

  const { data: reservation, error } = await supabase
    .from("reservations")
    .select("contact_email")
    .eq("id", reservationId)
    .maybeSingle();
  if (error || !reservation?.contact_email) return;

  await enqueuePaymentNotification(reservationId, paymentId, reservation.contact_email, kind);
}

export async function beginWebhookEvent(input: {
  provider: PaymentProvider;
  eventId: string;
  action: string;
  resourceType?: string | null;
  resourceId?: string | null;
  payload: unknown;
}) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("payment_webhook_events")
    .insert({
      provider: input.provider,
      provider_event_id: input.eventId,
      action: input.action,
      resource_type: input.resourceType ?? null,
      resource_id: input.resourceId ?? null,
      signature_valid: true,
      payload: input.payload,
    })
    .select("id")
    .single();

  if (error?.code === "23505") {
    const { data: existing, error: existingError } = await supabase
      .from("payment_webhook_events")
      .select("id, processed_at")
      .eq("provider", input.provider)
      .eq("provider_event_id", input.eventId)
      .eq("action", input.action)
      .single();
    if (existingError) throw existingError;
    return existing.processed_at ? null : (existing.id as string);
  }
  if (error) throw error;
  return data.id as string;
}

export async function finishWebhookEvent(eventId: string, processingError?: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("payment_webhook_events")
    .update({
      processed_at: processingError ? null : new Date().toISOString(),
      processing_error: processingError ?? null,
    })
    .eq("id", eventId);
  if (error) throw error;
}

export class PaymentRequestError extends Error {
  constructor(message: string, public readonly status = 400) {
    super(message);
  }
}

export function publicPaymentError(error: unknown) {
  if (error instanceof PaymentRequestError) {
    return { message: error.message, status: error.status };
  }
  console.error("Payment integration error", error);
  return { message: "No pudimos abrir la pasarela de pago. Inténtalo nuevamente.", status: 500 };
}
