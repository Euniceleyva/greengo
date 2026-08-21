import { NextResponse } from "next/server";
import { applyProviderPayment, beginWebhookEvent, finishWebhookEvent } from "@/lib/payments/core";
import {
  getMercadoPagoPayment,
  mapMercadoPagoMethod,
  mapMercadoPagoStatus,
  validateMercadoPagoSignature,
} from "@/lib/payments/mercado-pago";

type MercadoPagoWebhook = {
  id?: string | number;
  action?: string;
  type?: string;
  data?: { id?: string | number };
};

export async function POST(request: Request) {
  let payload: MercadoPagoWebhook;
  try {
    payload = JSON.parse(await request.text()) as MercadoPagoWebhook;
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const url = new URL(request.url);
  const bodyDataId = payload.data?.id == null ? null : String(payload.data.id);
  const dataId = url.searchParams.get("data.id") ?? bodyDataId;
  if (
    !validateMercadoPagoSignature({
      xSignature: request.headers.get("x-signature"),
      xRequestId: request.headers.get("x-request-id"),
      dataId,
    })
  ) {
    return NextResponse.json({ error: "Firma inválida." }, { status: 401 });
  }
  if (payload.type !== "payment" || !dataId) return NextResponse.json({ received: true });

  const eventId = String(payload.id ?? `${payload.action ?? "payment.updated"}:${dataId}`);
  const action = payload.action ?? "payment.updated";
  const webhookEventId = await beginWebhookEvent({
    provider: "mercado_pago",
    eventId,
    action,
    resourceType: payload.type,
    resourceId: dataId,
    payload,
  });
  if (!webhookEventId) return NextResponse.json({ received: true, duplicate: true });

  try {
    const payment = await getMercadoPagoPayment(dataId);
    await applyProviderPayment({
      provider: "mercado_pago",
      externalReference: payment.external_reference,
      providerOrderId: payment.order?.id ? String(payment.order.id) : null,
      providerPaymentId: String(payment.id),
      status: mapMercadoPagoStatus(payment.status),
      method: mapMercadoPagoMethod(payment),
      statusDetail: payment.status_detail,
      paidAt: payment.date_approved,
      amountMinor: Math.round(payment.transaction_amount * 100),
      currency: payment.currency_id,
      metadata: {
        payment_method_id: payment.payment_method_id,
        payment_type_id: payment.payment_type_id,
      },
    });
    await finishWebhookEvent(webhookEventId);
    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo procesar el evento.";
    await finishWebhookEvent(webhookEventId, message);
    console.error("Unable to process Mercado Pago webhook", error);
    return NextResponse.json({ error: "No se pudo procesar el evento." }, { status: 500 });
  }
}
