"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Home, Mail, MapPin } from "lucide-react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useReservationStore } from "@/stores/reservation-store";
import { useDemoStore } from "@/stores/demo-store";
import { useHydrated } from "@/lib/hooks";
import { LOCATIONS } from "@/mocks/locations";
import { getFareBreakdown, CUSTOM_QUOTE_LABEL } from "@/mocks/pricing";
import { SERVICE_TYPE_LABELS } from "@/constants";
import { formatMXN } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/misc";

gsap.registerPlugin(useGSAP);

export function ConfirmationClient() {
  const hydrated = useHydrated();
  const router = useRouter();

  const draft = useReservationStore((s) => s.draft);
  const confirmedFolio = useReservationStore((s) => s.confirmedFolio);
  const setConfirmedFolio = useReservationStore((s) => s.setConfirmedFolio);
  const resetReservation = useReservationStore((s) => s.resetReservation);
  const createTrip = useDemoStore((s) => s.createTrip);
  const createdRef = React.useRef(false);
  const confirmationRef = React.useRef<HTMLDivElement>(null);

  const hasDraft = Boolean(draft.serviceType && draft.originLocationId && draft.destinationLocationId);

  React.useEffect(() => {
    if (!hydrated || createdRef.current || confirmedFolio || !hasDraft) return;
    createdRef.current = true;

    const origin = LOCATIONS.find((l) => l.id === draft.originLocationId);
    const destination = LOCATIONS.find((l) => l.id === draft.destinationLocationId);
    const fare = getFareBreakdown({
      serviceType: draft.serviceType!,
      originLocationId: draft.originLocationId!,
      destinationLocationId: draft.destinationLocationId!,
      passengers: draft.passengers,
      bags: draft.bags,
      time: draft.time,
      isRoundTrip: draft.direction === "redondo",
    });

    const trip = createTrip({
      serviceType: draft.serviceType!,
      client: draft.contactName || "Cliente web",
      passengers: draft.passengers,
      origin: origin?.name ?? "—",
      destination: destination?.name ?? "—",
      date: draft.date,
      time: draft.time,
      amount: fare.isCustomQuote ? 0 : fare.total,
      driverId: null,
      vehicleId: null,
      flightNumber: draft.flightNumber || undefined,
      hotel: draft.hotel || undefined,
      specialInstructions: draft.notes || undefined,
      originCoord: origin?.coord,
      destinationCoord: destination?.coord,
      folioPrefix: "GG-WEB",
    });

    setConfirmedFolio(trip.folio);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, hasDraft, confirmedFolio]);

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

  if (!confirmedFolio && !hasDraft) {
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

  const fare = getFareBreakdown({
    serviceType,
    originLocationId: draft.originLocationId ?? "",
    destinationLocationId: draft.destinationLocationId ?? "",
    passengers: draft.passengers,
    bags: draft.bags,
    time: draft.time,
    isRoundTrip: draft.direction === "redondo",
  });

  return (
    <div ref={confirmationRef} className="adventure-confirmation">
      <section data-confirmation-hero className="adventure-confirmation-hero">
        <div data-confirmation-stamp className="adventure-confirmation-stamp" aria-hidden>
          <Check />
          <span>CONFIRMADO</span>
        </div>
        <div data-confirmation-copy className="adventure-confirmation-copy">
          <p>YA ESTÁ EN EL MAPA</p>
          <h1>¡Listo! Tu viaje ya está en marcha.</h1>
          <p>Guardamos tu ruta y la enviamos al equipo. Conserva este folio para cualquier cambio.</p>
        </div>
        <div data-confirmation-copy className="adventure-confirmation-folio">
          <span>FOLIO DE VIAJE</span>
          <strong>{confirmedFolio}</strong>
          <small>CUN · MAREA CLUB</small>
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
          <SummaryRow label="Contacto" value={draft.contactName} />
          <SummaryRow label="Correo" value={draft.contactEmail} />
          </dl>
          <div className="adventure-confirmation-total">
            <span>Total pagado</span>
            <strong>
            {fare.isCustomQuote ? CUSTOM_QUOTE_LABEL : formatMXN(fare.total)}
            </strong>
          </div>
        </section>

        <aside data-confirmation-detail className="adventure-confirmation-next">
          <div className="adventure-confirmation-next__icon"><Mail aria-hidden /></div>
          <h2>¿Qué sigue?</h2>
          <p>Te enviaremos la confirmación al correo proporcionado (simulado, sin envío real).</p>
          <div className="adventure-confirmation-next__route">
            <span>Ahora sí:</span>
            <strong>maleta lista,<br />modo Caribe.</strong>
          </div>
          <Button onClick={onBackHome} className="adventure-cta w-full">
            <Home aria-hidden /> Volver al inicio <ArrowRight aria-hidden />
          </Button>
          <p className="adventure-confirmation-demo">
            Esta reservación ya aparece en el panel administrativo del DEMO (Servicios / Viajes).
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
