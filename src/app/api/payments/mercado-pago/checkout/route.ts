import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { paymentCheckoutSchema } from "@/lib/schemas";
import {
  getOrCreatePaymentAttempt,
  getPayableReservation,
  getSiteUrl,
  publicPaymentError,
  updatePaymentAttempt,
} from "@/lib/payments/core";
import {
  createMercadoPagoPreference,
  mercadoPagoCheckoutUrl,
} from "@/lib/payments/mercado-pago";
import { PayloadTooLargeError, rateLimitResponse, readJsonBody } from "@/lib/http-guards";

const MAX_BODY_BYTES = 2_000;

export async function POST(request: Request) {
  const limited = rateLimitResponse(request, "payments:mercado-pago:checkout", 10, 300);
  if (limited) return limited;

  try {
    const body = await readJsonBody(request, MAX_BODY_BYTES);
    const { reservationReference } = paymentCheckoutSchema.parse(body);
    const reservation = await getPayableReservation(reservationReference);
    const payment = await getOrCreatePaymentAttempt(reservation, "mercado_pago", "card");

    if (payment.status === "approved") {
      return NextResponse.json({
        checkoutUrl: `${getSiteUrl()}/pago/confirmacion?provider=mercado_pago&reference=${reservation.public_reference}`,
      });
    }
    if (payment.checkout_url) return NextResponse.json({ checkoutUrl: payment.checkout_url });

    const siteUrl = getSiteUrl();
    const successUrl = new URL("/pago/confirmacion", siteUrl);
    successUrl.searchParams.set("provider", "mercado_pago");
    successUrl.searchParams.set("reference", reservation.public_reference);
    successUrl.searchParams.set("return", "success");
    const pendingUrl = new URL(successUrl);
    pendingUrl.searchParams.set("return", "pending");
    const failureUrl = new URL("/pago/checkout", siteUrl);
    failureUrl.searchParams.set("provider", "mercado_pago");
    failureUrl.searchParams.set("reference", reservation.public_reference);
    failureUrl.searchParams.set("return", "failure");

    const preference = await createMercadoPagoPreference(
      {
        items: [
          {
            id: reservation.folio,
            title: `Traslado GreenGo ${reservation.folio}`,
            description: `${reservation.origin_name} a ${reservation.destination_name}`.slice(0, 256),
            category_id: "services",
            quantity: 1,
            currency_id: reservation.currency,
            unit_price: Number((Number(reservation.total_minor) / 100).toFixed(2)),
          },
        ],
        payer: { name: reservation.contact_name, email: reservation.contact_email },
        external_reference: payment.external_reference,
        back_urls: {
          success: successUrl.toString(),
          pending: pendingUrl.toString(),
          failure: failureUrl.toString(),
        },
        auto_return: "approved",
        binary_mode: false,
        metadata: {
          reservation_reference: reservation.public_reference,
          reservation_folio: reservation.folio,
        },
      },
      payment.idempotency_key,
    );

    const checkoutUrl = mercadoPagoCheckoutUrl(preference);
    await updatePaymentAttempt(payment.id, {
      status: "pending",
      provider_order_id: preference.id,
      checkout_url: checkoutUrl,
      metadata: { reservation_folio: reservation.folio, preference_id: preference.id },
    });

    return NextResponse.json({ checkoutUrl });
  } catch (error) {
    if (error instanceof PayloadTooLargeError) {
      return NextResponse.json({ error: error.message }, { status: 413 });
    }
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Referencia de reservación inválida." }, { status: 400 });
    }
    const publicError = publicPaymentError(error);
    return NextResponse.json({ error: publicError.message }, { status: publicError.status });
  }
}
