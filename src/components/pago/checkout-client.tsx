"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, LockKeyhole, ShieldAlert } from "lucide-react";
import { useReservationStore } from "@/stores/reservation-store";
import { useHydrated } from "@/lib/hooks";
import { LOCATIONS } from "@/mocks/locations";
import { getFareBreakdown, CUSTOM_QUOTE_LABEL } from "@/mocks/pricing";
import { SERVICE_TYPE_LABELS } from "@/constants";
import { formatMXN } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/misc";
import { PaymentMethodSelector, type CheckoutMethod } from "./payment-method-selector";
import { CardForm, type CardFormHandle } from "./card-form";

// TODO(prod): reemplazar esta pasarela simulada por Mercado Pago Checkout Pro / Stripe.
const SIMULATED_DELAY_MS = 2000;

export function CheckoutClient() {
  const hydrated = useHydrated();
  const router = useRouter();
  const draft = useReservationStore((s) => s.draft);

  const [method, setMethod] = React.useState<CheckoutMethod>("tarjeta");
  const [forceReject, setForceReject] = React.useState(false);
  const [status, setStatus] = React.useState<"idle" | "loading" | "rejected">("idle");
  const cardFormRef = React.useRef<CardFormHandle>(null);

  if (!hydrated) {
    return (
      <Card className="adventure-checkout-panel p-6 sm:p-8">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="mt-6 h-48 w-full" />
      </Card>
    );
  }

  const hasDraft = Boolean(draft.serviceType && draft.originLocationId && draft.destinationLocationId);

  if (!hasDraft) {
    return (
      <Card className="adventure-checkout-panel p-6 text-center sm:p-8">
        <p className="font-bold text-muted-foreground">Todavía no hay una ruta lista para pagar.</p>
        <Link href="/reservar" className="mt-4 inline-block">
          <Button className="adventure-cta">Armar mi ruta</Button>
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
    <div className="adventure-checkout__layout">
      <div className="adventure-demo-notice">
        <ShieldAlert className="h-5 w-5 shrink-0" aria-hidden />
        <p>
          <span className="font-extrabold">Modo demostración:</span> no se procesa ningún pago real. Esta pasarela
          simula la experiencia final.
        </p>
      </div>

      <Card className="adventure-checkout-receipt p-6 sm:p-7">
        <div className="adventure-checkout-receipt__heading">
          <div>
            <span>RECIBO DE RUTA</span>
            <h2>Tu reserva</h2>
          </div>
          <strong>CUN / 001</strong>
        </div>
        <dl className="adventure-checkout-summary mt-6">
          <SummaryRow label="Servicio" value={SERVICE_TYPE_LABELS[serviceType]} />
          <SummaryRow label="Ruta" value={`${origin?.name ?? "—"} → ${destination?.name ?? "—"}`} />
          <SummaryRow label="Fecha y hora" value={`${draft.date} · ${draft.time}`} />
          <SummaryRow label="Pasajeros" value={String(draft.passengers)} />
        </dl>
        <div className="adventure-checkout-total">
          <span>Total a pagar</span>
          <strong>
            {fare.isCustomQuote ? CUSTOM_QUOTE_LABEL : formatMXN(fare.total)}
          </strong>
        </div>
        <p className="adventure-checkout-receipt__foot">Traslado · Caribe Mexicano · Buen viaje</p>
      </Card>

      <Card className="adventure-checkout-panel p-6 sm:p-8">
        <div className="adventure-payment-heading">
          <div>
            <span>PAGO SEGURO</span>
            <h2>¿Cómo quieres pagar?</h2>
          </div>
          <LockKeyhole className="h-6 w-6" aria-hidden />
        </div>
        <div className="mt-4">
          <PaymentMethodSelector value={method} onChange={setMethod} />
        </div>

        <div className="mt-6">
          {method === "tarjeta" && <CardForm ref={cardFormRef} />}
          {method === "oxxo" && (
            <p className="adventure-payment-note">
              Al confirmar, generaremos una referencia de pago para liquidar en cualquier tienda OXXO (simulado).
            </p>
          )}
          {method === "spei" && (
            <p className="adventure-payment-note">
              Al confirmar, generaremos una CLABE interbancaria para realizar tu transferencia SPEI (simulado).
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
          Forzar escenario de pago rechazado (demo)
        </label>

        {status === "rejected" && (
          <div className="adventure-payment-error mt-4 flex items-start gap-3 p-4 text-sm text-destructive">
            <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden />
            <div>
              <p className="font-semibold">Tu pago fue rechazado.</p>
              <p className="mt-1">Verifica los datos e inténtalo de nuevo, o elige otro método de pago.</p>
            </div>
          </div>
        )}

        <div className="adventure-payment-action mt-7">
          <p><LockKeyhole aria-hidden /> Tus datos se usan solo para esta simulación.</p>
          <Button onClick={onPay} disabled={status === "loading"} className="adventure-cta min-w-[168px]">
            {status === "loading" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Procesando…
              </>
            ) : (
              `Pagar ${fare.isCustomQuote ? "" : formatMXN(fare.total)}`
            )}
          </Button>
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
