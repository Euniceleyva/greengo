import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSiteUrl, updatePaymentAttempt } from "@/lib/payments/core";
import { capturePayPalOrder, payPalCapture } from "@/lib/payments/paypal";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const orderId = requestUrl.searchParams.get("token");
  const reference = requestUrl.searchParams.get("reference");
  const destination = new URL("/pago/confirmacion", getSiteUrl());
  destination.searchParams.set("provider", "paypal");
  if (reference) destination.searchParams.set("reference", reference);

  if (!orderId || !reference) {
    destination.searchParams.set("return", "failure");
    return NextResponse.redirect(destination);
  }

  try {
    const supabase = createAdminClient();
    const { data: reservation, error: reservationError } = await supabase
      .from("reservations")
      .select("id")
      .eq("public_reference", reference)
      .maybeSingle();
    if (reservationError) throw reservationError;
    if (!reservation) throw new Error("Reservación no encontrada.");

    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select("id, idempotency_key, provider_order_id")
      .eq("provider", "paypal")
      .eq("reservation_id", reservation.id)
      .eq("provider_order_id", orderId)
      .maybeSingle();
    if (paymentError) throw paymentError;
    if (!payment) throw new Error("La orden de PayPal no pertenece a esta reservación.");

    const order = await capturePayPalOrder(orderId, `${payment.idempotency_key}-capture`);
    const capture = payPalCapture(order);
    await updatePaymentAttempt(payment.id, {
      status: order.status === "COMPLETED" ? "pending" : "action_required",
      provider_payment_id: capture?.id ?? null,
      provider_status_detail: capture?.status ?? order.status,
      metadata: { order_status: order.status, capture_status: capture?.status },
    });
    destination.searchParams.set("return", "processing");
  } catch (error) {
    console.error("Unable to capture PayPal order", error);
    destination.searchParams.set("return", "failure");
  }

  return NextResponse.redirect(destination);
}
