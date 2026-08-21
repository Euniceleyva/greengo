import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import type { PaymentMethod, PaymentStatus } from "@/lib/payments/core";

const API_URL = "https://api.mercadopago.com";

export type MercadoPagoPreference = {
  id: string;
  init_point: string;
  sandbox_init_point?: string;
};

export type MercadoPagoPayment = {
  id: number;
  status: string;
  status_detail?: string;
  external_reference?: string | null;
  transaction_amount: number;
  currency_id: string;
  payment_method_id?: string;
  payment_type_id?: string;
  date_approved?: string | null;
  order?: { id?: string | number };
};

function accessToken() {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN?.trim();
  if (!token) throw new Error("MERCADO_PAGO_ACCESS_TOKEN no está configurado.");
  return token;
}

async function mercadoPagoRequest<T>(path: string, init?: RequestInit) {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Mercado Pago respondió ${response.status}: ${detail.slice(0, 500)}`);
  }
  return (await response.json()) as T;
}

export function createMercadoPagoPreference(body: Record<string, unknown>, idempotencyKey: string) {
  return mercadoPagoRequest<MercadoPagoPreference>("/checkout/preferences", {
    method: "POST",
    headers: { "X-Idempotency-Key": idempotencyKey },
    body: JSON.stringify(body),
  });
}

export function getMercadoPagoPayment(paymentId: string) {
  return mercadoPagoRequest<MercadoPagoPayment>(`/v1/payments/${encodeURIComponent(paymentId)}`);
}

export function mercadoPagoCheckoutUrl(preference: MercadoPagoPreference) {
  const environment = process.env.MERCADO_PAGO_ENV?.toLowerCase() ?? "test";
  return environment === "production"
    ? preference.init_point
    : preference.sandbox_init_point ?? preference.init_point;
}

export function validateMercadoPagoSignature(input: {
  xSignature: string | null;
  xRequestId: string | null;
  dataId: string | null;
}) {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET?.trim();
  if (!secret || !input.xSignature || !input.xRequestId || !input.dataId) return false;

  const signatureParts = Object.fromEntries(
    input.xSignature.split(",").map((part) => {
      const [key, ...value] = part.trim().split("=");
      return [key, value.join("=")];
    }),
  );
  const timestamp = signatureParts.ts;
  const received = signatureParts.v1;
  if (!timestamp || !received || !/^[a-f0-9]{64}$/i.test(received)) return false;

  const manifest = `id:${input.dataId};request-id:${input.xRequestId};ts:${timestamp};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");
  return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(received, "hex"));
}

export function mapMercadoPagoStatus(status: string): PaymentStatus {
  const statuses: Record<string, PaymentStatus> = {
    approved: "approved",
    pending: "pending",
    in_process: "pending",
    in_mediation: "action_required",
    rejected: "rejected",
    cancelled: "cancelled",
    refunded: "refunded",
    charged_back: "charged_back",
  };
  return statuses[status] ?? "pending";
}

export function mapMercadoPagoMethod(payment: MercadoPagoPayment): PaymentMethod {
  if (payment.payment_method_id === "oxxo" || payment.payment_type_id === "ticket") return "oxxo";
  if (payment.payment_method_id === "spei" || payment.payment_type_id === "bank_transfer") return "spei";
  return "card";
}
