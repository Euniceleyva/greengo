"use client";

import { useRouter } from "next/navigation";
import { useReservationStore } from "@/stores/reservation-store";
import { LOCATIONS } from "@/mocks/locations";
import { getFareBreakdown, CUSTOM_QUOTE_LABEL } from "@/mocks/pricing";
import { SERVICE_TYPE_LABELS } from "@/constants";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/misc";
import { formatMXN } from "@/lib/utils";

export function Step4Summary() {
  const router = useRouter();
  const draft = useReservationStore((s) => s.draft);
  const setStep = useReservationStore((s) => s.setStep);

  const origin = LOCATIONS.find((l) => l.id === draft.originLocationId);
  const destination = LOCATIONS.find((l) => l.id === draft.destinationLocationId);
  const serviceType = draft.serviceType ?? "aeropuerto";

  const fare = getFareBreakdown({
    serviceType,
    originLocationId: draft.originLocationId ?? "",
    destinationLocationId: draft.destinationLocationId ?? "",
    passengers: draft.passengers,
    bags: draft.bags,
    time: draft.time,
    isRoundTrip: draft.direction === "redondo",
  });

  const onContinue = () => router.push("/pago/checkout");

  return (
    <div>
      <div className="rounded-xl border border-border bg-surface-soft p-5">
        <h3 className="font-heading text-sm font-semibold text-foreground">Resumen del viaje</h3>
        <dl className="mt-3 grid gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
          <SummaryRow label="Servicio" value={SERVICE_TYPE_LABELS[serviceType]} />
          <SummaryRow label="Sentido" value={draft.direction === "redondo" ? "Redondo" : "Sencillo"} />
          <SummaryRow label="Origen" value={origin?.name ?? "—"} />
          <SummaryRow label="Destino" value={destination?.name ?? "—"} />
          <SummaryRow label="Fecha y hora" value={draft.date && draft.time ? `${draft.date} · ${draft.time}` : "—"} />
          <SummaryRow label="Pasajeros" value={String(draft.passengers)} />
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

      <div className="mt-6 rounded-xl border border-border p-5">
        <h3 className="font-heading text-sm font-semibold text-foreground">Desglose de tarifa (estimado)</h3>

        {fare.isCustomQuote ? (
          <p className="mt-3 text-sm text-muted-foreground">
            {CUSTOM_QUOTE_LABEL}: nuestro equipo te contactará para confirmar el costo de tu solución a medida.
          </p>
        ) : (
          <table className="mt-3 w-full text-sm">
            <tbody>
              {fare.hourlyRate ? (
                <FareRow
                  label={`Renta por hora (${fare.hours} h × ${formatMXN(fare.hourlyRate)})`}
                  value={fare.base}
                />
              ) : (
                <FareRow label="Tarifa base (hasta 4 pasajeros)" value={fare.base} />
              )}
              {fare.extraPassengers > 0 && (
                <FareRow
                  label={`Pasajeros adicionales (${fare.extraPassengers} × ${formatMXN(fare.extraPassengerFee)})`}
                  value={fare.extraPassengerCost}
                />
              )}
              {fare.extraBags > 0 && (
                <FareRow label={`Maletas adicionales (${fare.extraBags})`} value={fare.bagsFee} />
              )}
              {fare.nightSurcharge > 0 && <FareRow label="Recargo nocturno (22:00–06:00)" value={fare.nightSurcharge} />}
              {fare.isRoundTrip && <FareRow label="Viaje redondo (× 2)" value={fare.subtotal} />}
            </tbody>
          </table>
        )}

        <Separator className="my-4" />
        <div className="flex items-center justify-between">
          <span className="font-heading text-base font-semibold text-foreground">Total estimado</span>
          <span className="font-heading text-xl font-bold text-primary">
            {fare.isCustomQuote ? CUSTOM_QUOTE_LABEL : formatMXN(fare.total)}
          </span>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <Button type="button" variant="outline" onClick={() => setStep(3)}>
          Atrás
        </Button>
        <Button type="button" onClick={onContinue}>
          Continuar al pago
        </Button>
      </div>
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

function FareRow({ label, value }: { label: string; value: number }) {
  return (
    <tr>
      <td className="py-1 text-muted-foreground">{label}</td>
      <td className="py-1 text-right font-medium text-foreground">{formatMXN(value)}</td>
    </tr>
  );
}
