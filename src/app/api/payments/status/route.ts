import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimitResponse } from "@/lib/http-guards";

const querySchema = z.string().uuid();

export async function GET(request: Request) {
  const limited = rateLimitResponse(request, "payments:status", 30, 60);
  if (limited) return limited;

  const reference = new URL(request.url).searchParams.get("reference");
  const parsed = querySchema.safeParse(reference);
  if (!parsed.success) {
    return NextResponse.json({ error: "Referencia inválida." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: reservation, error } = await supabase
    .from("reservations")
    .select("id, folio, status, total_minor, currency, latest_payment_status, latest_payment_method")
    .eq("public_reference", parsed.data)
    .maybeSingle();
  if (error) {
    console.error("Unable to read public payment status", error.message);
    return NextResponse.json({ error: "No pudimos consultar el pago." }, { status: 500 });
  }
  if (!reservation) return NextResponse.json({ error: "Reservación no encontrada." }, { status: 404 });

  let paymentQuery = supabase
    .from("payments")
    .select("provider, status, method")
    .eq("reservation_id", reservation.id)
    .order("created_at", { ascending: false });
  if (reservation.latest_payment_status) {
    paymentQuery = paymentQuery.eq("status", reservation.latest_payment_status);
  }
  const { data: latestPayment, error: paymentError } = await paymentQuery.limit(1).maybeSingle();
  if (paymentError) {
    console.error("Unable to read latest public payment", paymentError.message);
    return NextResponse.json({ error: "No pudimos consultar el pago." }, { status: 500 });
  }

  return NextResponse.json({
    folio: reservation.folio,
    reservationStatus: reservation.status,
    paymentStatus: reservation.latest_payment_status ?? latestPayment?.status ?? null,
    paymentMethod: reservation.latest_payment_method ?? latestPayment?.method ?? null,
    provider: latestPayment?.provider ?? null,
    amountMinor: Number(reservation.total_minor),
    currency: reservation.currency,
  });
}
