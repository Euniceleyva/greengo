import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { paymentCheckoutSchema } from "@/lib/schemas";
import {
  getOrCreatePaymentAttempt,
  getPayableReservation,
  getSiteUrl,
  minorToDecimal,
  publicPaymentError,
  updatePaymentAttempt,
} from "@/lib/payments/core";
import { createPayPalOrder, payPalApprovalUrl } from "@/lib/payments/paypal";

export async function POST(request: Request) {
  try {
    const { reservationReference } = paymentCheckoutSchema.parse(await request.json());
    const reservation = await getPayableReservation(reservationReference);
    const payment = await getOrCreatePaymentAttempt(reservation, "paypal", "paypal");

    if (payment.status === "approved") {
      return NextResponse.json({
        checkoutUrl: `${getSiteUrl()}/pago/confirmacion?provider=paypal&reference=${reservation.public_reference}`,
      });
    }
    if (payment.checkout_url) return NextResponse.json({ checkoutUrl: payment.checkout_url });

    const siteUrl = getSiteUrl();
    const returnUrl = new URL("/api/payments/paypal/return", siteUrl);
    returnUrl.searchParams.set("reference", reservation.public_reference);
    const cancelUrl = new URL("/pago/checkout", siteUrl);
    cancelUrl.searchParams.set("provider", "paypal");
    cancelUrl.searchParams.set("reference", reservation.public_reference);
    cancelUrl.searchParams.set("return", "cancelled");

    const order = await createPayPalOrder(
      {
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: payment.external_reference,
            custom_id: payment.external_reference,
            invoice_id: `${reservation.folio}-${payment.id.slice(0, 8)}`,
            description: `${reservation.origin_name} a ${reservation.destination_name}`.slice(0, 127),
            amount: {
              currency_code: reservation.currency,
              value: minorToDecimal(reservation.total_minor),
            },
          },
        ],
        payment_source: {
          paypal: {
            experience_context: {
              brand_name: process.env.PAYMENT_BRAND_NAME?.trim() || "GreenGo Transfers Cancun",
              locale: "es-MX",
              landing_page: "LOGIN",
              shipping_preference: "NO_SHIPPING",
              user_action: "PAY_NOW",
              return_url: returnUrl.toString(),
              cancel_url: cancelUrl.toString(),
            },
          },
        },
      },
      payment.idempotency_key,
    );

    const checkoutUrl = payPalApprovalUrl(order);
    if (!checkoutUrl) throw new Error("PayPal no devolvió una URL de aprobación.");
    await updatePaymentAttempt(payment.id, {
      status: "action_required",
      provider_order_id: order.id,
      checkout_url: checkoutUrl,
      provider_status_detail: order.status,
      metadata: { reservation_folio: reservation.folio, order_status: order.status },
    });
    return NextResponse.json({ checkoutUrl });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Referencia de reservación inválida." }, { status: 400 });
    }
    const publicError = publicPaymentError(error);
    return NextResponse.json({ error: publicError.message }, { status: publicError.status });
  }
}
