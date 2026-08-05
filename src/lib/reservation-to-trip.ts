import { LOCATIONS } from "@/mocks/locations";
import { getFareBreakdown } from "@/mocks/pricing";
import type { NewTripInput } from "@/stores/demo-store";
import type { ReservationDraft } from "@/types";

export function reservationDraftToTripInput(draft: ReservationDraft): NewTripInput | null {
  if (!draft.serviceType || !draft.originLocationId || !draft.destinationLocationId) {
    return null;
  }

  const origin = LOCATIONS.find((location) => location.id === draft.originLocationId);
  const destination = LOCATIONS.find((location) => location.id === draft.destinationLocationId);
  const fare = getFareBreakdown({
    serviceType: draft.serviceType,
    originLocationId: draft.originLocationId,
    destinationLocationId: draft.destinationLocationId,
    passengers: draft.passengers,
    bags: draft.bags,
    time: draft.time,
    isRoundTrip: draft.direction === "redondo",
  });

  return {
    serviceType: draft.serviceType,
    direction: draft.direction,
    bookingSource: "web",
    client: draft.contactName || "Cliente web",
    contactEmail: draft.contactEmail || undefined,
    contactPhone: draft.contactPhone || undefined,
    passengers: draft.passengers,
    bags: draft.bags,
    origin: origin?.name ?? "Origen por confirmar",
    destination: destination?.name ?? "Destino por confirmar",
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
    paymentStatus: fare.isCustomQuote ? "cotizacion" : "pagado",
    autoAssign: true,
  };
}
