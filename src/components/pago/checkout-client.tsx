"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock3, CreditCard, Landmark, LockKeyhole, WalletCards } from "lucide-react";
import { useReservationStore } from "@/stores/reservation-store";
import { useHydrated } from "@/lib/hooks";
import { LOCATIONS } from "@/mocks/locations";
import { SERVICE_TYPE_LABELS } from "@/constants";
import { LocalizedCurrency } from "@/components/shared/public-language";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/misc";

export function CheckoutClient() {
  const hydrated = useHydrated();
  const router = useRouter();
  const draft = useReservationStore((state) => state.draft);
  const receipt = useReservationStore((state) => state.reservationReceipt);

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
          <SummaryRow label="Servicio" value={SERVICE_TYPE_LABELS[draft.serviceType]} />
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
          La reservación ya aparece en el panel de GreenGo. Cuando las pasarelas estén activas, podrás continuar con
          Mercado Pago o PayPal sin que GreenGo almacene los datos de tu tarjeta.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3" aria-label="Métodos próximos de pago">
          <PaymentPreview icon={CreditCard} label="Mercado Pago" detail="Tarjetas y Amex" />
          <PaymentPreview icon={WalletCards} label="PayPal" detail="México y EE. UU." />
          <PaymentPreview icon={Landmark} label="SPEI" detail="Transferencia" />
        </div>

        <div className="adventure-payment-action mt-7">
          <p><LockKeyhole aria-hidden /> No se procesó ningún cargo.</p>
          <Button onClick={() => router.push("/pago/confirmacion")} className="adventure-cta min-w-[190px]">
            Ver confirmación
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

function PaymentPreview({
  icon: Icon,
  label,
  detail,
}: {
  icon: typeof CreditCard;
  label: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface-soft p-4">
      <Icon className="h-5 w-5 text-primary" aria-hidden />
      <p className="mt-2 text-sm font-bold text-foreground">{label}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}
