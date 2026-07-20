// Lógica mock del mini-cotizador de la Landing Page (hero). Calcula un
// estimado ilustrativo para los 4 tipos de traslado del hero y resuelve cómo
// prellenar el formulario multi-paso de /reservar (que trabaja con
// identificadores de src/mocks/locations.ts). No reflejan tarifas reales.

import type { HeroQuoteEstimate, ServiceType, TransferKind, TourOrigin } from "@/types";
import { FALLBACK_HOTEL_TO_HOTEL_RATE, NIGHT_SURCHARGE } from "@/mocks/pricing";
import { AIRPORTS } from "@/mocks/airports";
import type { TourDestination } from "@/mocks/tour-destinations";

// Tarifa base (MXN) por aeropuerto para traslados Hotel-Aeropuerto /
// Aeropuerto-Hotel. Solo CUN tiene tarifas reales en src/mocks/pricing.ts;
// el resto son estimados ilustrativos según distancia aproximada.
const AIRPORT_BASE_RATE_MXN: Record<string, number> = {
  "airport-cun": 850,
  "airport-tqo": 1400,
  "airport-czm": 1200,
  "airport-ctm": 2000,
};

const EXTRA_PASSENGER_FEE_MXN = 80;

function isNightTime(time: string): boolean {
  if (!time) return false;
  const hours = Number(time.split(":")[0]);
  return hours >= 22 || hours < 6;
}

export function transferKindToServiceType(kind: TransferKind): ServiceType {
  if (kind === "hotel_hotel") return "hotel_hotel";
  return "aeropuerto"; // hotel_aeropuerto, aeropuerto_hotel y tour son "aeropuerto" (ver README §1)
}

// LOCATIONS no incluye los cientos de hoteles de hoteles.txt, así que se usan
// placeholders genéricos (categoría "hotel"/"aeropuerto") para que el paso 1
// y el desglose de tarifa de /reservar sigan funcionando sin cambios. El
// hotel/destino real elegido en el hero se conserva en el campo "hotel" y
// "notes" del borrador para no perder esa información.
const GENERIC_HOTEL_LOCATION_ID = "loc-riu-cancun";
const GENERIC_AIRPORT_LOCATION_ID = "loc-aeropuerto";
const GENERIC_HOTEL_LOCATION_ID_2 = "loc-moon-palace";

const TOUR_DESTINATION_TO_LOCATION_ID: Record<string, string> = {
  "tour-tulum": "loc-tulum",
  "tour-puerto-morelos": "loc-puerto-morelos",
  "tour-playa-del-carmen-ferry-to-cozumel": "loc-playa-carmen",
  "tour-ferry-to-isla-mujeres": "loc-isla-mujeres",
  "tour-cancun": "loc-zona-hotelera",
};
const FALLBACK_TOUR_DESTINATION_LOCATION_ID = "loc-xcaret";

export function tourDestinationLocationId(destinationId: string): string {
  return TOUR_DESTINATION_TO_LOCATION_ID[destinationId] ?? FALLBACK_TOUR_DESTINATION_LOCATION_ID;
}

export function heroOriginLocationId(kind: TransferKind, tourOrigin?: TourOrigin): string {
  if (kind === "aeropuerto_hotel") return GENERIC_AIRPORT_LOCATION_ID;
  if (kind === "tour") return tourOrigin === "aeropuerto" ? GENERIC_AIRPORT_LOCATION_ID : GENERIC_HOTEL_LOCATION_ID;
  return GENERIC_HOTEL_LOCATION_ID; // hotel_hotel, hotel_aeropuerto
}

export function heroDestinationLocationId(kind: TransferKind, tourDestinationId?: string): string {
  if (kind === "hotel_hotel") return GENERIC_HOTEL_LOCATION_ID_2;
  if (kind === "hotel_aeropuerto") return GENERIC_AIRPORT_LOCATION_ID;
  if (kind === "aeropuerto_hotel") return GENERIC_HOTEL_LOCATION_ID;
  return tourDestinationLocationId(tourDestinationId ?? "");
}

export interface HeroQuoteInput {
  kind: TransferKind;
  passengers: number;
  time: string;
  airportId?: string; // hotel_aeropuerto | aeropuerto_hotel | tour (cuando origen = aeropuerto)
  tourDestination?: TourDestination; // tour
}

export function estimateHeroQuote(input: HeroQuoteInput): HeroQuoteEstimate {
  const { kind, passengers, time } = input;
  const night = isNightTime(time);
  const extraPassengers = Math.max(0, passengers - 4);

  if (kind === "hotel_hotel") {
    const base = FALLBACK_HOTEL_TO_HOTEL_RATE;
    const total = base + extraPassengers * 60 + (night ? NIGHT_SURCHARGE : 0);
    return {
      currency: "MXN",
      total,
      label: extraPassengers > 0 ? `Tarifa base + ${extraPassengers} pasajero(s) extra` : "Tarifa base (hasta 4 pasajeros)",
    };
  }

  if (kind === "hotel_aeropuerto" || kind === "aeropuerto_hotel") {
    const airport = AIRPORTS.find((a) => a.id === input.airportId);
    const base = AIRPORT_BASE_RATE_MXN[input.airportId ?? ""] ?? AIRPORT_BASE_RATE_MXN["airport-cun"];
    const total = base + extraPassengers * EXTRA_PASSENGER_FEE_MXN + (night ? NIGHT_SURCHARGE : 0);
    return {
      currency: "MXN",
      total,
      label: airport ? `Tarifa base a/desde ${airport.code}` : "Tarifa base",
    };
  }

  // tour
  const destino = input.tourDestination;
  const base = destino?.priceFromUSD ?? 0;
  const total = base + extraPassengers * 10;
  return {
    currency: "USD",
    total,
    label: destino ? `Desde ${destino.name} · ${destino.transferLabel} desde el aeropuerto` : "Cotización de tour",
  };
}

export function formatUSD(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}
