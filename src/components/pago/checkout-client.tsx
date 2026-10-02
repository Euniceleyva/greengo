"use client";

import * as React from "react";
import Link from "next/link";
import { Clock3, CreditCard, Loader2, LockKeyhole, WalletCards } from "lucide-react";
import { useReservationStore } from "@/stores/reservation-store";
import { useHydrated } from "@/lib/hooks";
import { LOCATIONS } from "@/mocks/locations";
import { PUBLIC_SERVICE_TYPE_LABELS } from "@/constants";
import { LocalizedCurrency } from "@/components/shared/public-language";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/misc";

export function CheckoutClient({
  mercadoPagoEnabled,
  paypalEnabled,
}: {
  mercadoPagoEnabled: boolean;
  paypalEnabled: boolean;
}) {
  const hydrated = useHydrated();
  const draft = useReservationStore((state) => state.draft);
  const receipt = useReservationStore((state) => state.reservationReceipt);
  const [processing, setProcessing] = React.useState<"mercado-pago" | "paypal" | null>(null);
  const [paymentError, setPaymentError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const returned = new URLSearchParams(window.location.search).get("return");
    if (returned === "failure") setPaymentError("El pago no fue aprobado. Puedes intentarlo nuevamente.");
    if (returned === "cancelled") setPaymentError("Cancelaste el proceso de PayPal. No se realizó ningún cargo.");
  }, []);

  if (!hydrated) {
    return (
      <Card className="adventure-checkout-panel p-6 sm:p-8">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="mt-6 h-48 w-full" />
      </Card>
    );
  }

  if (!receipt || !draft.serviceType) {
    return (
      <Card className="adventure-checkout-panel p-6 text-center sm:p-8">
        <p className="font-bold text-muted-foreground">Todavía no hay una reservación registrada.</p>
        <Link href="/reservar" className="mt-4 inline-block">
          <Button className="adventure-cta">Armar mi ruta</Button>
        </Link>
      </Card>
    );
  }

  const origin = LOCATIONS.find((location) => location.id === draft.originLocationId);
  const destination = LOCATIONS.find((location) => location.id === draft.destinationLocationId);
  const amount = receipt.amountMinor / 100;

  const openCheckout = async (provider: "mercado-pago" | "paypal") => {
    setPaymentError(null);
    setProcessing(provider);
    try {
      const response = await fetch(`/api/payments/${provider}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservationReference: receipt.publicReference }),
      });
      const result = (await response.json()) as { checkoutUrl?: string; error?: string };
      if (!response.ok || !result.checkoutUrl) {
        throw new Error(result.error || "No pudimos abrir la pasarela.");
      }
      window.location.assign(result.checkoutUrl);
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : "No pudimos abrir la pasarela.");
      setProcessing(null);
    }
  };

  return (
    <div className="adventure-checkout__layout">
      <div className="adventure-demo-notice">
        <Clock3 className="h-5 w-5 shrink-0" aria-hidden />
        <p>
          <span className="font-extrabold">Reservación registrada:</span>{" "}
          {receipt.requiresQuote
            ? "el equipo confirmará la tarifa antes de solicitarte un pago."
            : "el pago permanece pendiente hasta abrir la pasarela segura."}
        </p>
      </div>

      <Card className="adventure-checkout-receipt p-6 sm:p-7">
        <div className="adventure-checkout-receipt__heading">
          <div>
            <span>RECIBO DE RUTA</span>
            <h2>Tu reservación</h2>
          </div>
          <strong>{receipt.folio}</strong>
        </div>
        <dl className="adventure-checkout-summary mt-6">
          <SummaryRow label="Servicio" value={PUBLIC_SERVICE_TYPE_LABELS[draft.serviceType]} />
          <SummaryRow label="Ruta" value={`${origin?.name ?? "—"} → ${destination?.name ?? "—"}`} />
          <SummaryRow label="Fecha y hora" value={`${draft.date} · ${draft.time}`} />
          <SummaryRow label="Pasajeros" value={String(draft.passengers)} />
        </dl>
        <div className="adventure-checkout-total">
          <span>{receipt.requiresQuote ? "Importe" : "Total pendiente"}</span>
          <strong>{receipt.requiresQuote ? "Por cotizar" : <LocalizedCurrency amount={amount} />}</strong>
        </div>
        <p className="adventure-checkout-receipt__foot">
          Estado: {receipt.requiresQuote ? "Solicitud de cotización" : "Esperando pago"}
        </p>
      </Card>

      <Card className="adventure-checkout-panel p-6 sm:p-8">
        <div className="adventure-payment-heading">
          <div>
            <span>PAGO SEGURO</span>
            <h2>{receipt.requiresQuote ? "Primero confirmaremos tu tarifa" : "Tu pago está pendiente"}</h2>
          </div>
          <LockKeyhole className="h-6 w-6" aria-hidden />
        </div>

        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Elige una pasarela segura. GreenGo nunca recibe ni almacena los datos de tu tarjeta.
        </p>

        {paymentError && (
          <div className="adventure-payment-note adventure-payment-error mt-5" role="alert">
            {paymentError}
          </div>
        )}

        <div className="adventure-payment-methods adventure-payment-methods--providers mt-6" aria-label="Pasarelas de pago">
          {mercadoPagoEnabled && (
            <button
              type="button"
              className="adventure-payment-method"
              onClick={() => openCheckout("mercado-pago")}
              disabled={Boolean(processing) || receipt.requiresQuote}
            >
              {processing === "mercado-pago" ? <Loader2 className="animate-spin" aria-hidden /> : <CreditCard aria-hidden />}
              <span className="text-left">
                <strong className="block">Mercado Pago</strong>
                <small className="block font-medium">Visa, Mastercard, American Express, OXXO y SPEI</small>
              </span>
            </button>
          )}
          {paypalEnabled && (
            <button
              type="button"
              className="adventure-payment-method"
              onClick={() => openCheckout("paypal")}
              disabled={Boolean(processing) || receipt.requiresQuote}
            >
              {processing === "paypal" ? <Loader2 className="animate-spin" aria-hidden /> : <WalletCards aria-hidden />}
              <span className="text-left">
                <strong className="block">PayPal</strong>
                <small className="block font-medium">Saldo PayPal y opciones habilitadas en tu cuenta</small>
              </span>
            </button>
          )}
          {!mercadoPagoEnabled && !paypalEnabled && !receipt.requiresQuote && (
            <div className="adventure-payment-note" role="status">
              El pago en línea no está disponible temporalmente. Tu reservación permanece registrada y el equipo te contactará.
            </div>
          )}
        </div>

        <div className="adventure-payment-action mt-7">
          <p><LockKeyhole aria-hidden /> El pago se confirma únicamente después de validar la notificación del proveedor.</p>
          <span className="text-xs font-bold text-muted-foreground">
            {receipt.requiresQuote ? "Pago deshabilitado hasta confirmar la tarifa" : "Importe protegido por el servidor"}
          </span>
        </div>
      </Card>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
