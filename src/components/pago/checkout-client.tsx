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
import { formatMXN } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/landing/ui/public-controls";
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
      <Card className="p-6 sm:p-8">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="mt-6 h-48 w-full" />
      </Card>
    );
  }

  const hasDraft = Boolean(draft.serviceType && draft.originLocationId && draft.destinationLocationId);

  if (!hasDraft) {
    return (
      <Card className="p-6 text-center sm:p-8">
        <p className="text-sm text-tropical-muted">No hay ninguna reservación en curso.</p>
        <Link href="/reservar" className="mt-4 inline-block">
          <Button>Iniciar una reservación</Button>
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
          <span className="font-semibold">Modo demostración —</span> no se procesa ningún pago real. Esta pasarela
          es una simulación visual para la presentación del DEMO.
        </p>
      </div>

      <Card className="p-6 sm:p-8">
        <h2 className="font-urbanist text-lg font-semibold text-tropical-text">Resumen de la reserva</h2>
        <dl className="mt-4 grid gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
          <SummaryRow label="Servicio" value={SERVICE_TYPE_LABELS[serviceType]} />
          <SummaryRow label="Ruta" value={`${origin?.name ?? "—"} → ${destination?.name ?? "—"}`} />
          <SummaryRow label="Fecha y hora" value={`${draft.date} · ${draft.time}`} />
          <SummaryRow label="Pasajeros" value={String(draft.passengers)} />
        </dl>
        <div className="mt-4 flex items-center justify-between border-t border-tropical-border pt-4">
          <span className="font-urbanist font-semibold text-tropical-text">Total a pagar</span>
          <span className="font-urbanist text-xl font-bold text-tropical-primary">
            {fare.isCustomQuote ? CUSTOM_QUOTE_LABEL : formatMXN(fare.total)}
          </span>
        </div>
      </Card>

      <Card className="p-6 sm:p-8">
        <h2 className="font-urbanist text-lg font-semibold text-tropical-text">Método de pago</h2>
        <div className="mt-4">
          <PaymentMethodSelector value={method} onChange={setMethod} />
        </div>

        <div className="mt-6">
          {method === "tarjeta" && <CardForm ref={cardFormRef} />}
          {method === "oxxo" && (
            <p className="rounded-lg bg-tropical-surface p-4 text-sm text-tropical-muted">
              Al confirmar, generaremos una referencia de pago para liquidar en cualquier tienda OXXO (simulado).
            </p>
          )}
          {method === "spei" && (
            <p className="rounded-lg bg-tropical-surface p-4 text-sm text-tropical-muted">
              Al confirmar, generaremos una CLABE interbancaria para realizar tu transferencia SPEI (simulado).
            </p>
          )}
        </div>

        <label className="mt-6 flex min-h-[44px] items-center gap-2 text-sm text-tropical-muted">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={forceReject}
            onChange={(e) => setForceReject(e.target.checked)}
          />
          Forzar escenario de pago rechazado (demo)
        </label>

        {status === "rejected" && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive-soft p-4 text-sm text-destructive">
            <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden />
            <div>
              <p className="font-semibold">Tu pago fue rechazado.</p>
              <p className="mt-1">Verifica los datos e inténtalo de nuevo, o elige otro método de pago.</p>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Button onClick={onPay} disabled={status === "loading"} className="min-w-[140px]">
            {status === "loading" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Procesando…
              </>
            ) : (
              "Pagar"
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
      <dt className="text-tropical-muted">{label}</dt>
      <dd className="font-medium text-tropical-text">{value}</dd>
    </div>
  );
}
