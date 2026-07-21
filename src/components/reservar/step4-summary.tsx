"use client";

import { useRouter } from "next/navigation";
import { Plane, MapPin, Calendar, Users, Luggage, Ticket } from "lucide-react";
import { useReservationStore } from "@/stores/reservation-store";
import { LOCATIONS } from "@/mocks/locations";
import { getFareBreakdown, CUSTOM_QUOTE_LABEL } from "@/mocks/pricing";
import { SERVICE_TYPE_LABELS } from "@/constants";
import { Button } from "@/components/landing/ui/public-controls";
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
      {/* Pase de traslado — resumen del viaje */}
      <div className="overflow-hidden rounded-[24px] border-2 border-dashed border-tropical-primary-light/60 bg-tropical-card shadow-sketch">
        <div className="flex items-center justify-between gap-3 bg-gradient-tropical px-5 py-4 text-white">
          <div className="flex items-center gap-2">
            <Ticket className="h-5 w-5" aria-hidden />
            <span className="font-urbanist text-sm font-extrabold">Pase de traslado — GreenGo</span>
          </div>
          <span className="font-hand text-lg">Cancún</span>
        </div>

        <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <div className="sm:col-span-2">
            <p className="font-urbanist text-xs font-bold uppercase tracking-wide text-tropical-secondary">
              {SERVICE_TYPE_LABELS[serviceType]} · {draft.direction === "redondo" ? "Viaje redondo" : "Sencillo"}
            </p>
            <div className="mt-2 flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-urbanist text-base font-bold text-tropical-text">{origin?.name ?? "—"}</p>
                <p className="text-xs text-tropical-muted">Origen</p>
              </div>
              <svg viewBox="0 0 60 12" className="h-3 w-12 shrink-0 text-tropical-accent" aria-hidden fill="none">
                <path d="M1 6 H54" stroke="currentColor" strokeWidth="2" strokeDasharray="1 6" strokeLinecap="round" />
                <path d="M50 2 L56 6 L50 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="min-w-0 flex-1 text-right">
                <p className="truncate font-urbanist text-base font-bold text-tropical-text">{destination?.name ?? "—"}</p>
                <p className="text-xs text-tropical-muted">Destino</p>
              </div>
            </div>
          </div>

          <SummaryField
            icon={Calendar}
            label="Fecha y hora"
            value={draft.date && draft.time ? `${draft.date} · ${draft.time}` : "—"}
          />
          <SummaryField icon={Users} label="Pasajeros" value={String(draft.passengers)} />
          <SummaryField icon={Luggage} label="Maletas" value={String(draft.bags)} />
          <SummaryField icon={Plane} label="Vuelo" value={draft.flightNumber || "—"} />
          <SummaryField icon={MapPin} label="Hotel" value={draft.hotel || "—"} />
          <SummaryField label="Contacto" value={draft.contactName || "—"} />
          <SummaryField label="Correo" value={draft.contactEmail || "—"} />
          <SummaryField label="Teléfono" value={draft.contactPhone || "—"} />

          {draft.notes && (
            <p className="sm:col-span-2 rounded-xl bg-tropical-surface p-3 text-sm text-tropical-muted">
              <span className="font-semibold text-tropical-text">Notas: </span>
              {draft.notes}
            </p>
          )}
        </div>

        {/* Perforación tipo boleto */}
        <div className="relative border-t-2 border-dashed border-tropical-border">
          <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-tropical-background" aria-hidden />
          <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-tropical-background" aria-hidden />
        </div>

        <div className="p-5 sm:p-6">
          <h3 className="font-urbanist text-sm font-bold text-tropical-text">Desglose de tarifa (estimado)</h3>

          {fare.isCustomQuote ? (
            <p className="mt-3 text-sm text-tropical-muted">
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

          <div className="mt-4 flex items-center justify-between rounded-xl bg-tropical-surface px-4 py-3">
            <span className="font-urbanist text-base font-bold text-tropical-text">Total estimado</span>
            <span className="font-urbanist text-2xl font-extrabold text-tropical-primary">
              {fare.isCustomQuote ? CUSTOM_QUOTE_LABEL : formatMXN(fare.total)}
            </span>
          </div>
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

function SummaryField({
  icon: Icon,
  label,
  value,
}: {
  icon?: typeof Calendar;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      {Icon && <Icon className="mt-0.5 h-4 w-4 shrink-0 text-tropical-secondary" aria-hidden />}
      <div className="min-w-0">
        <dt className="text-xs text-tropical-muted">{label}</dt>
        <dd className="truncate font-medium text-tropical-text">{value}</dd>
      </div>
    </div>
  );
}

function FareRow({ label, value }: { label: string; value: number }) {
  return (
    <tr>
      <td className="py-1 text-tropical-muted">{label}</td>
      <td className="py-1 text-right font-medium text-tropical-text">{formatMXN(value)}</td>
    </tr>
  );
}
