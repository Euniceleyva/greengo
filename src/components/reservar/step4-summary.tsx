"use client";

import { useRouter } from "next/navigation";
import { useReservationStore } from "@/stores/reservation-store";
import { LOCATIONS } from "@/mocks/locations";
import { getFareBreakdown, CUSTOM_QUOTE_LABEL } from "@/mocks/pricing";
import { SERVICE_TYPE_LABELS } from "@/constants";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/misc";
import { usePublicLocale } from "@/components/shared/public-locale";

export function Step4Summary() {
  const { text, money, locale } = usePublicLocale();
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
        <h3 className="font-heading text-sm font-semibold text-foreground">{text("Resumen del viaje", "Trip summary")}</h3>
        <dl className="mt-3 grid gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
          <SummaryRow label={text("Servicio", "Service")} value={locale === "es" ? SERVICE_TYPE_LABELS[serviceType] : ({hotel_hotel:"Hotel to hotel",aeropuerto:"Airport transfer",transporte_abierto:"Driver by the hour",a_medida:"Custom solution"} as Record<string,string>)[serviceType]} />
          <SummaryRow label={text("Sentido", "Trip type")} value={draft.direction === "redondo" ? text("Redondo", "Round trip") : text("Sencillo", "One way")} />
          <SummaryRow label={text("Origen", "Pickup")} value={origin?.name ?? "—"} />
          <SummaryRow label={text("Destino", "Destination")} value={destination?.name ?? "—"} />
          <SummaryRow label={text("Fecha y hora", "Date and time")} value={draft.date && draft.time ? `${draft.date} · ${draft.time}` : "—"} />
          <SummaryRow label={text("Pasajeros", "Passengers")} value={String(draft.passengers)} />
          <SummaryRow label={text("Maletas", "Bags")} value={String(draft.bags)} />
          <SummaryRow label="Vuelo" value={draft.flightNumber || "—"} />
          <SummaryRow label="Contacto" value={draft.contactName || "—"} />
          <SummaryRow label="Correo" value={draft.contactEmail || "—"} />
          <SummaryRow label="Teléfono" value={draft.contactPhone || "—"} />
          <SummaryRow label="Hotel" value={draft.hotel || "—"} />
        </dl>
        {draft.notes && (
          <p className="mt-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{text("Notas: ", "Notes: ")}</span>
            {draft.notes}
          </p>
        )}
      </div>

      <div className="mt-6 rounded-xl border border-border p-5">
        <h3 className="font-heading text-sm font-semibold text-foreground">{text("Desglose de tarifa (estimado)", "Estimated fare breakdown")}</h3>

        {fare.isCustomQuote ? (
          <p className="mt-3 text-sm text-muted-foreground">
            {text(`${CUSTOM_QUOTE_LABEL}: nuestro equipo te contactará para confirmar el costo de tu solución a medida.`, "Custom quote: our team will contact you to confirm the price of your tailored service.")}
          </p>
        ) : (
          <table className="mt-3 w-full text-sm">
            <tbody>
              {fare.hourlyRate ? (
                <FareRow
                  label={`${text("Renta por hora", "Hourly rental")} (${fare.hours} h × ${money(fare.hourlyRate)})`}
                  value={fare.base}
                  format={money}
                />
              ) : (
                <FareRow label={text("Tarifa base (hasta 4 pasajeros)", "Base fare (up to 4 passengers)")} value={fare.base} format={money} />
              )}
              {fare.extraPassengers > 0 && (
                <FareRow
                  label={`${text("Pasajeros adicionales", "Additional passengers")} (${fare.extraPassengers} × ${money(fare.extraPassengerFee)})`}
                  value={fare.extraPassengerCost}
                  format={money}
                />
              )}
              {fare.extraBags > 0 && (
                <FareRow label={`${text("Maletas adicionales", "Additional bags")} (${fare.extraBags})`} value={fare.bagsFee} format={money} />
              )}
              {fare.nightSurcharge > 0 && <FareRow label={text("Recargo nocturno (22:00–06:00)", "Night surcharge (10 pm–6 am)")} value={fare.nightSurcharge} format={money} />}
              {fare.isRoundTrip && <FareRow label={text("Viaje redondo (× 2)", "Round trip (× 2)")} value={fare.subtotal} format={money} />}
            </tbody>
          </table>
        )}

        <Separator className="my-4" />
        <div className="flex items-center justify-between">
          <span className="font-heading text-base font-semibold text-foreground">{text("Total estimado", "Estimated total")}</span>
          <span className="font-heading text-xl font-bold text-primary">
            {fare.isCustomQuote ? text(CUSTOM_QUOTE_LABEL, "Custom quote") : money(fare.total)}
          </span>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <Button type="button" variant="outline" onClick={() => setStep(3)}>
          {text("Atrás", "Back")}
        </Button>
        <Button type="button" onClick={onContinue}>
          {text("Continuar al pago", "Continue to payment")}
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

function FareRow({ label, value, format }: { label: string; value: number; format: (value: number) => string }) {
  return (
    <tr>
      <td className="py-1 text-muted-foreground">{label}</td>
      <td className="py-1 text-right font-medium text-foreground">{format(value)}</td>
    </tr>
  );
}
