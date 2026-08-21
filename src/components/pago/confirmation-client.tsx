"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Home, Mail, MapPin } from "lucide-react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useReservationStore } from "@/stores/reservation-store";
import { useHydrated } from "@/lib/hooks";
import { LOCATIONS } from "@/mocks/locations";
import { SERVICE_TYPE_LABELS } from "@/constants";
import { LocalizedCurrency } from "@/components/shared/public-language";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/misc";

gsap.registerPlugin(useGSAP);

type PublicPaymentStatus = {
  paymentStatus: "created" | "pending" | "action_required" | "approved" | "rejected" | "cancelled" | "expired" | "refunded" | "charged_back" | null;
  provider: "mercado_pago" | "paypal" | null;
};

export function ConfirmationClient({
  paymentReference,
  paymentReturn,
}: {
  paymentReference?: string;
  paymentReturn?: string;
}) {
  const hydrated = useHydrated();
  const router = useRouter();

  const draft = useReservationStore((s) => s.draft);
  const confirmedFolio = useReservationStore((s) => s.confirmedFolio);
  const receipt = useReservationStore((s) => s.reservationReceipt);
  const resetReservation = useReservationStore((s) => s.resetReservation);
  const confirmationRef = React.useRef<HTMLDivElement>(null);
  const [serverPayment, setServerPayment] = React.useState<PublicPaymentStatus | null>(null);

  const hasDraft = Boolean(draft.serviceType && draft.originLocationId && draft.destinationLocationId);
  const reference = paymentReference ?? receipt?.publicReference;

  React.useEffect(() => {
    if (!reference) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;

    const refresh = async () => {
      try {
        const response = await fetch(`/api/payments/status?reference=${encodeURIComponent(reference)}`, {
          cache: "no-store",
        });
        if (!response.ok) return;
        const status = (await response.json()) as PublicPaymentStatus;
        if (stopped) return;
        setServerPayment(status);
        attempts += 1;
        if (status.paymentStatus !== "approved" && attempts < 8) {
          timer = setTimeout(refresh, 2000);
        }
      } catch {
        // La reservación sigue visible aunque la consulta temporal del webhook falle.
      }
    };

    refresh();
    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
    };
  }, [reference]);

  const onBackHome = () => {
    resetReservation();
    router.push("/");
  };

  useGSAP(
    () => {
      if (!hydrated || !confirmedFolio) return;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
        timeline
          .from("[data-confirmation-hero]", { y: 20, scale: 0.985, opacity: 0, duration: 0.62 })
          .from("[data-confirmation-stamp]", { scale: 0.68, rotation: -14, opacity: 0, duration: 0.52 }, "-=0.34")
          .from("[data-confirmation-copy] > *", { y: 18, opacity: 0, stagger: 0.065, duration: 0.48 }, "-=0.34")
          .from("[data-confirmation-detail]", { y: 22, opacity: 0, stagger: 0.09, duration: 0.55 }, "-=0.2");
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set("[data-confirmation-hero], [data-confirmation-stamp], [data-confirmation-copy] > *, [data-confirmation-detail]", {
          clearProps: "all",
        });
      });

      return () => mm.revert();
    },
    { scope: confirmationRef, dependencies: [hydrated, confirmedFolio], revertOnUpdate: true },
  );

  if (!hydrated) {
    return (
      <Card className="adventure-confirmation-loading p-6 sm:p-8">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="mt-6 h-40 w-full" />
      </Card>
    );
  }

  if (!receipt || !confirmedFolio || !hasDraft) {
    return (
      <Card className="adventure-confirmation-empty p-6 text-center sm:p-8">
        <p className="font-bold text-muted-foreground">No encontramos información de una reservación reciente.</p>
        <Link href="/reservar" className="mt-4 inline-block">
          <Button className="adventure-cta">Iniciar una reservación</Button>
        </Link>
      </Card>
    );
  }

  const origin = LOCATIONS.find((l) => l.id === draft.originLocationId);
  const destination = LOCATIONS.find((l) => l.id === draft.destinationLocationId);
  const serviceType = draft.serviceType!;

  const amount = receipt.amountMinor / 100;
  const isPaid = serverPayment?.paymentStatus === "approved";
  const paymentFailed = paymentReturn === "failure" || ["rejected", "cancelled", "expired"].includes(serverPayment?.paymentStatus ?? "");
  const providerLabel = serverPayment?.provider === "paypal" ? "PayPal" : "Mercado Pago";

  return (
    <div ref={confirmationRef} className="adventure-confirmation">
      <section data-confirmation-hero className="adventure-confirmation-hero">
        <div data-confirmation-stamp className="adventure-confirmation-stamp" aria-hidden>
          <Check />
          <span>{isPaid ? "PAGADA" : "RECIBIDA"}</span>
        </div>
        <div data-confirmation-copy className="adventure-confirmation-copy">
          <p>{isPaid ? "PAGO CONFIRMADO" : "SOLICITUD REGISTRADA"}</p>
          <h1>{isPaid ? "¡Listo! Tu pago y tu viaje están confirmados." : "¡Listo! GreenGo ya recibió tu reservación."}</h1>
          <p>
            {paymentFailed
              ? "El pago no pudo completarse. Tu reservación permanece registrada para que puedas intentarlo nuevamente."
              : isPaid
                ? `La confirmación de ${providerLabel} fue validada de forma segura.`
                : receipt.requiresQuote
              ? "El equipo confirmará la tarifa antes de solicitarte un pago."
              : "Estamos validando la confirmación del proveedor. Este proceso puede tardar unos segundos."}
          </p>
        </div>
        <div data-confirmation-copy className="adventure-confirmation-folio">
          <span>FOLIO DE VIAJE</span>
          <strong>{confirmedFolio}</strong>
          <small>CUN · GREENGO TRANSFERS</small>
        </div>
      </section>

      <div className="adventure-confirmation-grid">
        <section data-confirmation-detail className="adventure-confirmation-receipt">
          <div className="adventure-confirmation-receipt__heading">
            <div>
              <span>RECIBO DE RUTA</span>
              <h2>Resumen del viaje</h2>
            </div>
            <MapPin aria-hidden />
          </div>
          <dl className="adventure-confirmation-summary">
          <SummaryRow label="Servicio" value={SERVICE_TYPE_LABELS[serviceType]} />
          <SummaryRow label="Sentido" value={draft.direction === "redondo" ? "Redondo" : "Sencillo"} />
          <SummaryRow label="Origen" value={origin?.name ?? "—"} />
          <SummaryRow label="Destino" value={destination?.name ?? "—"} />
          <SummaryRow label="Fecha y hora" value={`${draft.date} · ${draft.time}`} />
          <SummaryRow label="Pasajeros" value={String(draft.passengers)} />
          <SummaryRow label="Equipaje" value={`${draft.bags} piezas`} />
          <SummaryRow label="Contacto" value={draft.contactName} />
          <SummaryRow label="Teléfono" value={draft.contactPhone} />
          <SummaryRow label="Correo" value={draft.contactEmail} />
          </dl>
          <div className="adventure-confirmation-total">
            <span>{receipt.requiresQuote ? "Importe" : isPaid ? "Total pagado" : "Total pendiente"}</span>
            <strong>{receipt.requiresQuote ? "Por cotizar" : <LocalizedCurrency amount={amount} />}</strong>
          </div>
        </section>

        <aside data-confirmation-detail className="adventure-confirmation-next">
          <div className="adventure-confirmation-next__icon"><Mail aria-hidden /></div>
          <h2>{isPaid ? "Viaje confirmado" : "¿Qué sigue?"}</h2>
          <p>
            {isPaid
              ? "El equipo de GreenGo ya puede ver el pago aprobado en su panel y dará seguimiento a los detalles del traslado."
              : paymentFailed
                ? "Puedes volver al checkout y elegir nuevamente Mercado Pago o PayPal. No confirmamos cargos desde esta pantalla."
                : "El equipo verá la solicitud en su panel. El estado se actualizará automáticamente cuando llegue la confirmación segura del proveedor."}
          </p>
          <div className="adventure-confirmation-next__route">
            <span>Ahora sí:</span>
            <strong>maleta lista,<br />modo Caribe.</strong>
          </div>
          <Button onClick={onBackHome} className="adventure-cta w-full">
            <Home aria-hidden /> Volver al inicio <ArrowRight aria-hidden />
          </Button>
          <p className="adventure-confirmation-demo">
            {isPaid ? `Pago verificado por ${providerLabel}.` : "Esperando confirmación segura del pago."}
          </p>
        </aside>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value || "—"}</dd>
    </div>
  );
}
