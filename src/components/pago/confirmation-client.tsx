"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
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

export function ConfirmationClient() {
  const hydrated = useHydrated();
  const router = useRouter();

  const draft = useReservationStore((s) => s.draft);
  const confirmedFolio = useReservationStore((s) => s.confirmedFolio);
  const setConfirmedFolio = useReservationStore((s) => s.setConfirmedFolio);
  const resetReservation = useReservationStore((s) => s.resetReservation);
  const createTrip = useDemoStore((s) => s.createTrip);
  const createdRef = React.useRef(false);

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

  if (!hydrated) {
    return (
      <Card className="p-6 sm:p-8">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="mt-6 h-40 w-full" />
      </Card>
    );
  }

  if (!confirmedFolio && !hasDraft) {
    return (
      <Card className="p-6 text-center sm:p-8">
        <p className="text-sm text-muted-foreground">No encontramos información de una reservación reciente.</p>
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
    originLocationId: draft.originLocationId ?? "",
    destinationLocationId: draft.destinationLocationId ?? "",
    passengers: draft.passengers,
    bags: draft.bags,
    time: draft.time,
    isRoundTrip: draft.direction === "redondo",
  });

  return (
    <div className="space-y-6">
      <Card className="flex flex-col items-center p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success-soft text-success">
          <CheckCircle2 className="h-8 w-8" aria-hidden />
        </div>
        <h1 className="mt-4 font-heading text-2xl font-bold text-foreground">¡Reservación confirmada!</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Te enviaremos la confirmación al correo proporcionado (simulado, sin envío real).
        </p>
        <p className="mt-4 rounded-lg bg-surface-soft px-4 py-2 font-heading text-lg font-bold text-primary">
          {confirmedFolio}
        </p>
      </Card>

      <Card className="p-6 sm:p-8">
        <h2 className="font-heading text-lg font-semibold text-foreground">Resumen del viaje</h2>
        <dl className="mt-4 grid gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
          <SummaryRow label="Servicio" value={SERVICE_TYPE_LABELS[serviceType]} />
          <SummaryRow label="Sentido" value={draft.direction === "redondo" ? "Redondo" : "Sencillo"} />
          <SummaryRow label="Origen" value={origin?.name ?? "—"} />
          <SummaryRow label="Destino" value={destination?.name ?? "—"} />
          <SummaryRow label="Fecha y hora" value={`${draft.date} · ${draft.time}`} />
          <SummaryRow label="Pasajeros" value={String(draft.passengers)} />
          <SummaryRow label="Contacto" value={draft.contactName} />
          <SummaryRow label="Correo" value={draft.contactEmail} />
        </dl>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <span className="font-heading font-semibold text-foreground">Total pagado</span>
          <span className="font-heading text-xl font-bold text-primary">
            {fare.isCustomQuote ? CUSTOM_QUOTE_LABEL : formatMXN(fare.total)}
          </span>
        </div>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        Esta reservación ya aparece en el panel administrativo del DEMO (Servicios / Viajes).
      </p>

      <div className="flex justify-center">
        <Button onClick={onBackHome}>Volver al inicio</Button>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2 sm:block">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value || "—"}</dd>
    </div>
  );
}
