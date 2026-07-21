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
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/misc";
import { usePublicLocale } from "@/components/shared/public-locale";

export function ConfirmationClient() {
  const { text, money, locale } = usePublicLocale();
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
        <p className="text-sm text-muted-foreground">{text("No encontramos información de una reservación reciente.", "We could not find a recent booking.")}</p>
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
    originLocationId: draft.originLocationId ?? "",
    destinationLocationId: draft.destinationLocationId ?? "",
    passengers: draft.passengers,
    bags: draft.bags,
    time: draft.time,
    isRoundTrip: draft.direction === "redondo",
  });

  return (
    <div className="space-y-6">
      <Card className="marketing-panel flex flex-col items-center rounded-none p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success-soft text-success">
          <CheckCircle2 className="h-8 w-8" aria-hidden />
        </div>
        <h1 className="mt-4 font-heading text-2xl font-bold text-foreground">{text("¡Reservación confirmada!", "Booking confirmed!")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {text("Te enviaremos la confirmación al correo proporcionado (simulado, sin envío real).", "We will send confirmation to your email address (simulated; no email is sent).")}
        </p>
        <p className="mt-4 rounded-lg bg-surface-soft px-4 py-2 font-heading text-lg font-bold text-primary">
          {confirmedFolio}
        </p>
      </Card>

      <Card className="marketing-panel rounded-none p-6 sm:p-8">
        <h2 className="font-heading text-lg font-semibold text-foreground">{text("Resumen del viaje", "Trip summary")}</h2>
        <dl className="mt-4 grid gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
          <SummaryRow label={text("Servicio", "Service")} value={locale === "es" ? SERVICE_TYPE_LABELS[serviceType] : ({hotel_hotel:"Hotel to hotel",aeropuerto:"Airport transfer",transporte_abierto:"Driver by the hour",a_medida:"Custom solution"} as Record<string,string>)[serviceType]} />
          <SummaryRow label={text("Sentido", "Trip type")} value={draft.direction === "redondo" ? text("Redondo", "Round trip") : text("Sencillo", "One way")} />
          <SummaryRow label={text("Origen", "Pickup")} value={origin?.name ?? "—"} />
          <SummaryRow label={text("Destino", "Destination")} value={destination?.name ?? "—"} />
          <SummaryRow label={text("Fecha y hora", "Date and time")} value={`${draft.date} · ${draft.time}`} />
          <SummaryRow label={text("Pasajeros", "Passengers")} value={String(draft.passengers)} />
          <SummaryRow label={text("Contacto", "Contact")} value={draft.contactName} />
          <SummaryRow label={text("Correo", "Email")} value={draft.contactEmail} />
        </dl>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <span className="font-heading font-semibold text-foreground">{text("Total pagado", "Total paid")}</span>
          <span className="font-heading text-xl font-bold text-primary">
            {fare.isCustomQuote ? text(CUSTOM_QUOTE_LABEL, "Custom quote") : money(fare.total)}
          </span>
        </div>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        {text("Esta reservación ya aparece en el panel administrativo del DEMO (Servicios / Viajes).", "This booking now appears in the demo administration panel.")}
      </p>

      <div className="flex justify-center">
        <Button onClick={onBackHome}>{text("Volver al inicio", "Back home")}</Button>
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
