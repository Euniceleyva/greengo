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

export function ConfirmationClient() {
  const hydrated = useHydrated();
  const router = useRouter();

  const draft = useReservationStore((s) => s.draft);
  const confirmedFolio = useReservationStore((s) => s.confirmedFolio);
  const receipt = useReservationStore((s) => s.reservationReceipt);
  const resetReservation = useReservationStore((s) => s.resetReservation);
  const confirmationRef = React.useRef<HTMLDivElement>(null);

  const hasDraft = Boolean(draft.serviceType && draft.originLocationId && draft.destinationLocationId);

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

  return (
    <div ref={confirmationRef} className="adventure-confirmation">
      <section data-confirmation-hero className="adventure-confirmation-hero">
        <div data-confirmation-stamp className="adventure-confirmation-stamp" aria-hidden>
          <Check />
          <span>RECIBIDA</span>
        </div>
        <div data-confirmation-copy className="adventure-confirmation-copy">
          <p>SOLICITUD REGISTRADA</p>
          <h1>¡Listo! GreenGo ya recibió tu reservación.</h1>
          <p>
            {receipt.requiresQuote
              ? "El equipo confirmará la tarifa antes de solicitarte un pago."
              : "El viaje está apartado y permanece pendiente de pago."}
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
            <span>{receipt.requiresQuote ? "Importe" : "Total pendiente"}</span>
            <strong>{receipt.requiresQuote ? "Por cotizar" : <LocalizedCurrency amount={amount} />}</strong>
          </div>
        </section>

        <aside data-confirmation-detail className="adventure-confirmation-next">
          <div className="adventure-confirmation-next__icon"><Mail aria-hidden /></div>
          <h2>¿Qué sigue?</h2>
          <p>
            El equipo verá la solicitud en su panel y se pondrá en contacto contigo. El correo automático se activará
            antes de habilitar los pagos reales.
          </p>
          <div className="adventure-confirmation-next__route">
            <span>Ahora sí:</span>
            <strong>maleta lista,<br />modo Caribe.</strong>
          </div>
          <Button onClick={onBackHome} className="adventure-cta w-full">
            <Home aria-hidden /> Volver al inicio <ArrowRight aria-hidden />
          </Button>
          <p className="adventure-confirmation-demo">
            No se realizó ningún cargo.
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
