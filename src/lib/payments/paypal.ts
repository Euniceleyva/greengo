import "server-only";

import type { PaymentStatus } from "@/lib/payments/core";

type PayPalLink = { href: string; rel: string; method?: string };

export type PayPalOrder = {
  id: string;
  status: string;
  links?: PayPalLink[];
  purchase_units?: Array<{
    reference_id?: string;
    custom_id?: string;
    amount?: { currency_code: string; value: string };
    payments?: {
      captures?: Array<{
        id: string;
        status: string;
        amount?: { currency_code: string; value: string };
      }>;
    };
  }>;
};

export type PayPalWebhookEvent = {
  id: string;
  event_type: string;
  resource_type?: string;
  resource: {
    id?: string;
    status?: string;
    custom_id?: string;
    invoice_id?: string;
    amount?: { currency_code?: string; value?: string };
    create_time?: string;
    update_time?: string;
    supplementary_data?: { related_ids?: { order_id?: string } };
  };
};

function credentials() {
  const clientId = process.env.PAYPAL_CLIENT_ID?.trim();
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) throw new Error("Las credenciales de PayPal no están configuradas.");
  return { clientId, clientSecret };
}

export function paypalApiUrl() {
  return process.env.PAYPAL_ENV?.toLowerCase() === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

async function getAccessToken() {
  const { clientId, clientSecret } = credentials();
  const response = await fetch(`${paypalApiUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`PayPal no pudo autenticar la aplicación (${response.status}): ${detail.slice(0, 500)}`);
  }
  const payload = (await response.json()) as { access_token: string };
  return payload.access_token;
}

async function paypalRequest<T>(path: string, init?: RequestInit) {
  const token = await getAccessToken();
  const response = await fetch(`${paypalApiUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`PayPal respondió ${response.status}: ${detail.slice(0, 500)}`);
  }
  return (await response.json()) as T;
}

export function createPayPalOrder(body: Record<string, unknown>, requestId: string) {
  return paypalRequest<PayPalOrder>("/v2/checkout/orders", {
    method: "POST",
    headers: {
      "PayPal-Request-Id": requestId,
      Prefer: "return=representation",
    },
    body: JSON.stringify(body),
  });
}

export function capturePayPalOrder(orderId: string, requestId: string) {
  return paypalRequest<PayPalOrder>(`/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
    method: "POST",
    headers: {
      "PayPal-Request-Id": requestId,
      Prefer: "return=representation",
    },
    body: "{}",
  });
}

export async function verifyPayPalWebhook(headers: Headers, event: PayPalWebhookEvent) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID?.trim();
  if (!webhookId) throw new Error("PAYPAL_WEBHOOK_ID no está configurado.");

  const required = {
    auth_algo: headers.get("paypal-auth-algo"),
    cert_url: headers.get("paypal-cert-url"),
    transmission_id: headers.get("paypal-transmission-id"),
    transmission_sig: headers.get("paypal-transmission-sig"),
    transmission_time: headers.get("paypal-transmission-time"),
  };
  if (Object.values(required).some((value) => !value)) return false;

  const result = await paypalRequest<{ verification_status: string }>(
    "/v1/notifications/verify-webhook-signature",
    {
      method: "POST",
      body: JSON.stringify({ ...required, webhook_id: webhookId, webhook_event: event }),
    },
  );
  return result.verification_status === "SUCCESS";
}

export function payPalApprovalUrl(order: PayPalOrder) {
  return order.links?.find((link) => link.rel === "payer-action" || link.rel === "approve")?.href ?? null;
}

export function payPalCapture(order: PayPalOrder) {
  return order.purchase_units?.flatMap((unit) => unit.payments?.captures ?? [])[0] ?? null;
}

export function mapPayPalEventStatus(eventType: string): PaymentStatus | null {
  const statuses: Record<string, PaymentStatus> = {
    "PAYMENT.CAPTURE.COMPLETED": "approved",
    "PAYMENT.CAPTURE.PENDING": "pending",
    "PAYMENT.CAPTURE.DECLINED": "rejected",
    "PAYMENT.CAPTURE.DENIED": "rejected",
    "PAYMENT.CAPTURE.REFUNDED": "refunded",
    "PAYMENT.CAPTURE.REVERSED": "charged_back",
  };
  return statuses[eventType] ?? null;
}
