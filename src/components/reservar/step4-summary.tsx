"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { useReservationStore } from "@/stores/reservation-store";
import { getBookingZone } from "@/data/booking-zones";
import { PUBLIC_SERVICE_TYPE_LABELS } from "@/constants";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/misc";
import { LocalizedCurrency } from "@/components/shared/public-language";
import { getPublicFareQuote } from "@/lib/public-fares";

export function Step4Summary() {
  const router = useRouter();
  const draft = useReservationStore((s) => s.draft);
  const setStep = useReservationStore((s) => s.setStep);
  const submissionKey = useReservationStore((s) => s.submissionKey);
  const reservationReceipt = useReservationStore((s) => s.reservationReceipt);
  const setSubmissionKey = useReservationStore((s) => s.setSubmissionKey);
  const setReservationReceipt = useReservationStore((s) => s.setReservationReceipt);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState("");

  const origin = getBookingZone(draft.originLocationId);
  const destination = getBookingZone(draft.destinationLocationId);
  const serviceType = draft.serviceType ?? "aeropuerto";
  const fare = serviceType === "aeropuerto"
    ? getPublicFareQuote({
        originLocationId: draft.originLocationId ?? "",
        destinationLocationId: draft.destinationLocationId ?? "",
        passengers: draft.passengers,
        time: draft.time,
        direction: draft.direction,
        returnTime: draft.returnTime,
      })
    : null;

  const onContinue = async () => {
    if (reservationReceipt) {
      router.push("/pago/checkout");
      return;
    }

    const key = submissionKey ?? crypto.randomUUID();
    if (!submissionKey) setSubmissionKey(key);

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...draft, submissionKey: key }),
      });
      const result = await response.json();

      if (!response.ok || !result.reservation) {
        throw new Error(result.error || "No pudimos registrar la reservación.");
      }

      setReservationReceipt(result.reservation);
      router.push("/pago/checkout");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "No pudimos registrar la reservación.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="adventure-summary-card rounded-xl border border-border bg-surface-soft p-5">
        <h3 className="font-heading text-sm font-semibold text-foreground">Resumen del viaje</h3>
        <dl className="mt-3 grid gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
          <SummaryRow label="Servicio" value={PUBLIC_SERVICE_TYPE_LABELS[serviceType]} />
          <SummaryRow label="Sentido" value={draft.direction === "redondo" ? "Redondo" : "Sencillo"} />
          <SummaryRow label="Origen" value={origin?.name ?? "—"} />
          {draft.originHotelId && <SummaryRow label="Hotel de origen" value={selectedHotelName(origin, draft.originHotelId, draft.originHotelName)} />}
          <SummaryRow label="Destino" value={destination?.name ?? "—"} />
          {draft.destinationHotelId && <SummaryRow label="Hotel de destino" value={selectedHotelName(destination, draft.destinationHotelId, draft.destinationHotelName)} />}
          <SummaryRow label="Fecha y hora" value={draft.date && draft.time ? `${draft.date} · ${draft.time}` : "—"} />
          {draft.direction === "redondo" && (
            <SummaryRow label="Regreso" value={draft.returnDate && draft.returnTime ? `${draft.returnDate} · ${draft.returnTime}` : "—"} />
          )}
          <SummaryRow label="Pasajeros" value={String(draft.passengers)} />
          <SummaryRow
            label="Camionetas requeridas"
            value={String(Math.ceil(draft.passengers / 8))}
          />
          <SummaryRow label="Maletas" value={String(draft.bags)} />
          <SummaryRow label="Vuelo" value={draft.flightNumber || "—"} />
          <SummaryRow label="Contacto" value={draft.contactName || "—"} />
          <SummaryRow label="Correo" value={draft.contactEmail || "—"} />
          <SummaryRow label="Teléfono" value={draft.contactPhone || "—"} />
          <SummaryRow label="Hotel" value={draft.hotel || "—"} />
        </dl>
        {draft.notes && (
          <p className="mt-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Notas: </span>
            {draft.notes}
          </p>
        )}
      </div>

      <div className="adventure-fare-card mt-6 rounded-xl border border-border p-5">
        <h3 className="font-heading text-sm font-semibold text-foreground">
          {fare ? "Tarifa de tu ruta" : "Solicitud de cotización"}
        </h3>
        {fare ? (
          <div className="mt-3 space-y-2 text-sm text-muted-foreground">
            <p>Tarifa calculada con el tarifario vigente según ruta, horario y número de pasajeros.</p>
            <p>
              {fare.vehicleCount} {fare.vehicleCount === 1 ? "camioneta" : "camionetas"} · hasta 8 pasajeros por unidad
            </p>
            {(fare.departure.isNight || fare.returnLeg?.isNight) && (
              <p className="font-bold text-foreground">Tarifa nocturna aplicada (10:00 p. m.–5:00 a. m.).</p>
            )}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            Esta ruta requiere atención personalizada. Registraremos la solicitud sin cobrar y el equipo te confirmará la tarifa por WhatsApp.
          </p>
        )}
        <Separator className="my-4" />
        <div className="adventure-fare-total flex items-center justify-between">
          <span className="font-heading text-base font-semibold text-foreground">{fare ? "Total" : "Estado"}</span>
          <span className="font-heading text-base font-bold text-primary">
            {fare ? <LocalizedCurrency amount={fare.total} sourceCurrency={fare.currency} /> : "Por cotizar"}
          </span>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <Button type="button" variant="outline" onClick={() => setStep(3)}>
          Atrás
        </Button>
        <Button type="button" onClick={onContinue} disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {isSubmitting ? "Registrando…" : fare ? "Continuar al pago" : "Enviar solicitud"}
        </Button>
      </div>
      {submitError && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-destructive/25 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <p>{submitError}</p>
        </div>
      )}
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

function selectedHotelName(
  zone: ReturnType<typeof getBookingZone>,
  hotelId: string,
  customName: string,
) {
  return zone?.hotels.find((hotel) => hotel.id === hotelId)?.name.startsWith("Otro hotel")
    ? customName || "Otro alojamiento"
    : zone?.hotels.find((hotel) => hotel.id === hotelId)?.name ?? customName ?? "—";
}
