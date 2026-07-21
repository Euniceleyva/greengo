"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, ShieldAlert } from "lucide-react";
import { useReservationStore } from "@/stores/reservation-store";
import { useHydrated } from "@/lib/hooks";
import { LOCATIONS } from "@/mocks/locations";
import { getFareBreakdown, CUSTOM_QUOTE_LABEL } from "@/mocks/pricing";
import { SERVICE_TYPE_LABELS } from "@/constants";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/misc";
import { PaymentMethodSelector, type CheckoutMethod } from "./payment-method-selector";
import { CardForm, type CardFormHandle } from "./card-form";
import { usePublicLocale } from "@/components/shared/public-locale";

// TODO(prod): reemplazar esta pasarela simulada por Mercado Pago Checkout Pro / Stripe.
const SIMULATED_DELAY_MS = 2000;

export function CheckoutClient() {
  const { text, money, locale } = usePublicLocale();
  const hydrated = useHydrated();
  const router = useRouter();
  const draft = useReservationStore((s) => s.draft);

  const [method, setMethod] = React.useState<CheckoutMethod>("tarjeta");
  const [forceReject, setForceReject] = React.useState(false);
  const [status, setStatus] = React.useState<"idle" | "loading" | "rejected">("idle");
  const cardFormRef = React.useRef<CardFormHandle>(null);

  if (!hydrated) {
    return (
      <Card className="marketing-panel rounded-none p-6 sm:p-8">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="mt-6 h-48 w-full" />
      </Card>
    );
  }

  const hasDraft = Boolean(draft.serviceType && draft.originLocationId && draft.destinationLocationId);

  if (!hasDraft) {
    return (
      <Card className="p-6 text-center sm:p-8">
        <p className="text-sm text-muted-foreground">{text("No hay ninguna reservación en curso.", "There is no active booking.")}</p>
        <Link href="/reservar" className="mt-4 inline-block">
          <Button>{text("Iniciar una reservación", "Start a booking")}</Button>
        </Link>
      </Card>
    );
  }

  const origin = LOCATIONS.find((l) => l.id === draft.originLocationId);
  const destination = LOCATIONS.find((l) => l.id === draft.destinationLocationId);
  const serviceType = draft.serviceType!;

  const fare = getFareBreakdown({
    serviceType,
    originLocationId: draft.originLocationId!,
    destinationLocationId: draft.destinationLocationId!,
    passengers: draft.passengers,
    bags: draft.bags,
    time: draft.time,
    isRoundTrip: draft.direction === "redondo",
  });

  const onPay = async () => {
    if (method === "tarjeta") {
      const cardData = await cardFormRef.current?.submit();
      if (!cardData) return; // formulario inválido, no avanza
    }

    setStatus("loading");
    await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY_MS));

    if (forceReject) {
      setStatus("rejected");
      return;
    }

    router.push("/pago/confirmacion");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning-soft p-4 text-sm text-warning">
        <ShieldAlert className="h-5 w-5 shrink-0" aria-hidden />
        <p>
          <span className="font-semibold">{text("Modo demostración —", "Demo mode —")}</span> {text("no se procesa ningún pago real. Esta pasarela es una simulación visual para la presentación del DEMO.", "no real payment is processed. This checkout is a visual simulation for the demo.")}
        </p>
      </div>

      <Card className="marketing-panel rounded-none p-6 sm:p-8">
        <h2 className="font-heading text-lg font-semibold text-foreground">{text("Resumen de la reserva", "Booking summary")}</h2>
        <dl className="mt-4 grid gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
          <SummaryRow label={text("Servicio", "Service")} value={locale === "es" ? SERVICE_TYPE_LABELS[serviceType] : ({hotel_hotel:"Hotel to hotel",aeropuerto:"Airport transfer",transporte_abierto:"Driver by the hour",a_medida:"Custom solution"} as Record<string,string>)[serviceType]} />
          <SummaryRow label={text("Ruta", "Route")} value={`${origin?.name ?? "—"} → ${destination?.name ?? "—"}`} />
          <SummaryRow label={text("Fecha y hora", "Date and time")} value={`${draft.date} · ${draft.time}`} />
          <SummaryRow label={text("Pasajeros", "Passengers")} value={String(draft.passengers)} />
        </dl>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <span className="font-heading font-semibold text-foreground">{text("Total a pagar", "Total due")}</span>
          <span className="font-heading text-xl font-bold text-primary">
            {fare.isCustomQuote ? text(CUSTOM_QUOTE_LABEL, "Custom quote") : money(fare.total)}
          </span>
        </div>
      </Card>

      <Card className="p-6 sm:p-8">
        <h2 className="font-heading text-lg font-semibold text-foreground">{text("Método de pago", "Payment method")}</h2>
        <div className="mt-4">
          <PaymentMethodSelector value={method} onChange={setMethod} />
        </div>

        <div className="mt-6">
          {method === "tarjeta" && <CardForm ref={cardFormRef} />}
          {method === "oxxo" && (
            <p className="rounded-lg bg-surface-soft p-4 text-sm text-muted-foreground">
              {text("Al confirmar, generaremos una referencia de pago para liquidar en cualquier tienda OXXO (simulado).", "After confirmation, we will generate a payment reference for any OXXO store (simulated).")}
            </p>
          )}
          {method === "spei" && (
            <p className="rounded-lg bg-surface-soft p-4 text-sm text-muted-foreground">
              {text("Al confirmar, generaremos una CLABE interbancaria para realizar tu transferencia SPEI (simulado).", "After confirmation, we will generate a bank account number for your SPEI transfer (simulated).")}
            </p>
          )}
        </div>

        <label className="mt-6 flex min-h-[44px] items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={forceReject}
            onChange={(e) => setForceReject(e.target.checked)}
          />
          {text("Forzar escenario de pago rechazado (demo)", "Force declined payment scenario (demo)")}
        </label>

        {status === "rejected" && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive-soft p-4 text-sm text-destructive">
            <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden />
            <div>
              <p className="font-semibold">{text("Tu pago fue rechazado.", "Your payment was declined.")}</p>
              <p className="mt-1">{text("Verifica los datos e inténtalo de nuevo, o elige otro método de pago.", "Check your details and try again, or choose another payment method.")}</p>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Button onClick={onPay} disabled={status === "loading"} className="min-w-[140px]">
            {status === "loading" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> {text("Procesando…", "Processing…")}
              </>
            ) : (
              text("Pagar", "Pay")
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2 sm:block">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}
