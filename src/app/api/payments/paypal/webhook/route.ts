import { NextResponse } from "next/server";
import { applyProviderPayment, beginWebhookEvent, finishWebhookEvent } from "@/lib/payments/core";
import {
  mapPayPalEventStatus,
  type PayPalWebhookEvent,
  verifyPayPalWebhook,
} from "@/lib/payments/paypal";

export async function POST(request: Request) {
  let event: PayPalWebhookEvent;
  try {
    event = JSON.parse(await request.text()) as PayPalWebhookEvent;
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  try {
    if (!(await verifyPayPalWebhook(request.headers, event))) {
      return NextResponse.json({ error: "Firma inválida." }, { status: 401 });
    }
  } catch (error) {
    console.error("Unable to verify PayPal webhook", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ error: "No se pudo validar la firma." }, { status: 503 });
  }

  const status = mapPayPalEventStatus(event.event_type);
  if (!status) return NextResponse.json({ received: true, ignored: true });

  const webhookEventId = await beginWebhookEvent({
    provider: "paypal",
    eventId: event.id,
    action: event.event_type,
    resourceType: event.resource_type,
    resourceId: event.resource.id,
    payload: event,
  });
  if (!webhookEventId) return NextResponse.json({ received: true, duplicate: true });

  try {
    const amountValue = event.resource.amount?.value;
    const amountMinor = amountValue == null ? null : Math.round(Number(amountValue) * 100);
    await applyProviderPayment({
      provider: "paypal",
      externalReference: event.resource.custom_id,
      providerOrderId: event.resource.supplementary_data?.related_ids?.order_id,
      providerPaymentId: event.resource.id,
      status,
      method: "paypal",
      statusDetail: event.resource.status ?? event.event_type,
      paidAt: event.resource.update_time ?? event.resource.create_time,
      amountMinor,
      currency: event.resource.amount?.currency_code,
      metadata: { paypal_event_type: event.event_type },
    });
    await finishWebhookEvent(webhookEventId);
    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo procesar el evento.";
    await finishWebhookEvent(webhookEventId, message);
    console.error("Unable to process PayPal webhook", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ error: "No se pudo procesar el evento." }, { status: 500 });
  }
}
