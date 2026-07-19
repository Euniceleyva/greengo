import type { PricingRate, ServiceType } from "@/types";

// Tarifas mock (MXN) por par origen-destino, usadas únicamente para calcular
// un total ilustrativo en /reservar. No reflejan tarifas reales del negocio.
export const PRICING_RATES: PricingRate[] = [
  { id: "rate-aeropuerto-zona-hotelera", originLocationId: "loc-aeropuerto", destinationLocationId: "loc-zona-hotelera", vehicleType: "van", basePrice: 850, pricePerExtraPassenger: 80 },
  { id: "rate-aeropuerto-riu-cancun", originLocationId: "loc-aeropuerto", destinationLocationId: "loc-riu-cancun", vehicleType: "van", basePrice: 880, pricePerExtraPassenger: 80 },
  { id: "rate-aeropuerto-moon-palace", originLocationId: "loc-aeropuerto", destinationLocationId: "loc-moon-palace", vehicleType: "van", basePrice: 780, pricePerExtraPassenger: 70 },
  { id: "rate-aeropuerto-puerto-cancun", originLocationId: "loc-aeropuerto", destinationLocationId: "loc-puerto-cancun", vehicleType: "van", basePrice: 900, pricePerExtraPassenger: 80 },
  { id: "rate-aeropuerto-playa-carmen", originLocationId: "loc-aeropuerto", destinationLocationId: "loc-playa-carmen", vehicleType: "van", basePrice: 1450, pricePerExtraPassenger: 120 },
  { id: "rate-aeropuerto-puerto-morelos", originLocationId: "loc-aeropuerto", destinationLocationId: "loc-puerto-morelos", vehicleType: "van", basePrice: 1050, pricePerExtraPassenger: 90 },
  { id: "rate-aeropuerto-tulum", originLocationId: "loc-aeropuerto", destinationLocationId: "loc-tulum", vehicleType: "van", basePrice: 2200, pricePerExtraPassenger: 150 },
  { id: "rate-aeropuerto-xcaret", originLocationId: "loc-aeropuerto", destinationLocationId: "loc-xcaret", vehicleType: "van", basePrice: 1600, pricePerExtraPassenger: 130 },
  { id: "rate-aeropuerto-isla-mujeres", originLocationId: "loc-aeropuerto", destinationLocationId: "loc-isla-mujeres", vehicleType: "van", basePrice: 1100, pricePerExtraPassenger: 90 },
  { id: "rate-aeropuerto-cozumel", originLocationId: "loc-aeropuerto", destinationLocationId: "loc-cozumel", vehicleType: "van", basePrice: 1800, pricePerExtraPassenger: 140 },
  { id: "rate-aeropuerto-puerto-juarez", originLocationId: "loc-aeropuerto", destinationLocationId: "loc-puerto-juarez", vehicleType: "van", basePrice: 950, pricePerExtraPassenger: 80 },
  { id: "rate-zona-hotelera-puerto-cancun", originLocationId: "loc-zona-hotelera", destinationLocationId: "loc-puerto-cancun", vehicleType: "sedan", basePrice: 550, pricePerExtraPassenger: 50 },
];

// Tarifa plana (MXN) cuando no existe un par explícito en PRICING_RATES,
// por ejemplo hotel a hotel entre dos destinos sin ruta directa listada.
export const FALLBACK_HOTEL_TO_HOTEL_RATE = 700;

// Renta por hora (MXN) para "transporte abierto" (chofer + vehículo por periodo).
export const OPEN_TRANSPORT_HOURLY_RATE = 450;

// "Soluciones a medida" siempre se cotizan por separado con el equipo comercial.
export const CUSTOM_QUOTE_LABEL = "Cotización personalizada";

export const NIGHT_SURCHARGE = 150; // 22:00–06:00
export const EXTRA_BAG_FEE = 40; // por maleta adicional después de 2 por pasajero

export function findRate(
  originLocationId: string,
  destinationLocationId: string,
): PricingRate | undefined {
  return PRICING_RATES.find(
    (r) =>
      (r.originLocationId === originLocationId && r.destinationLocationId === destinationLocationId) ||
      (r.originLocationId === destinationLocationId && r.destinationLocationId === originLocationId),
  );
}

export interface FareBreakdown {
  base: number;
  extraPassengers: number;
  extraPassengerFee: number;
  extraPassengerCost: number;
  extraBags: number;
  bagsFee: number;
  nightSurcharge: number;
  isRoundTrip: boolean;
  isNight: boolean;
  isCustomQuote: boolean;
  hourlyRate?: number;
  hours?: number;
  subtotal: number;
  total: number;
}

function isNightTime(time: string): boolean {
  if (!time) return false;
  const [hoursStr] = time.split(":");
  const hours = Number(hoursStr);
  return hours >= 22 || hours < 6;
}

/** Desglose de tarifa mock usado en el paso 4 de /reservar. Solo para el DEMO. */
export function getFareBreakdown(params: {
  serviceType: ServiceType;
  originLocationId: string;
  destinationLocationId: string;
  passengers: number;
  bags: number;
  time: string;
  durationHours?: number;
  isRoundTrip: boolean;
}): FareBreakdown {
  const { serviceType, originLocationId, destinationLocationId, passengers, bags, time, durationHours, isRoundTrip } =
    params;

  const isNight = isNightTime(time);
  const nightSurcharge = isNight ? NIGHT_SURCHARGE : 0;

  if (serviceType === "a_medida") {
    return {
      base: 0,
      extraPassengers: 0,
      extraPassengerFee: 0,
      extraPassengerCost: 0,
      extraBags: 0,
      bagsFee: 0,
      nightSurcharge: 0,
      isRoundTrip,
      isNight,
      isCustomQuote: true,
      subtotal: 0,
      total: 0,
    };
  }

  if (serviceType === "transporte_abierto") {
    const hours = durationHours && durationHours > 0 ? durationHours : 4;
    const base = OPEN_TRANSPORT_HOURLY_RATE * hours;
    const subtotal = base + nightSurcharge;
    return {
      base,
      extraPassengers: 0,
      extraPassengerFee: 0,
      extraPassengerCost: 0,
      extraBags: 0,
      bagsFee: 0,
      nightSurcharge,
      isRoundTrip: false,
      isNight,
      isCustomQuote: false,
      hourlyRate: OPEN_TRANSPORT_HOURLY_RATE,
      hours,
      subtotal,
      total: subtotal,
    };
  }

  const rate = findRate(originLocationId, destinationLocationId);
  const base = rate ? rate.basePrice : FALLBACK_HOTEL_TO_HOTEL_RATE;
  const extraPassengerFee = rate ? rate.pricePerExtraPassenger : 60;
  const extraPassengers = Math.max(0, passengers - 4);
  const extraPassengerCost = extraPassengers * extraPassengerFee;

  const extraBags = Math.max(0, bags - passengers * 2);
  const bagsFee = extraBags * EXTRA_BAG_FEE;

  const subtotal = base + extraPassengerCost + bagsFee + nightSurcharge;
  const total = isRoundTrip ? subtotal * 2 : subtotal;

  return {
    base,
    extraPassengers,
    extraPassengerFee,
    extraPassengerCost,
    extraBags,
    bagsFee,
    nightSurcharge,
    isRoundTrip,
    isNight,
    isCustomQuote: false,
    subtotal,
    total,
  };
}
