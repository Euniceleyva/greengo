// Cálculo de tarifas: funciones puras, sin acceso a Supabase ni a "server-only".
// create-reservation.ts se encarga de obtener las reglas de precio y ubicaciones
// desde la base de datos y de orquestar la creación de la reservación.

import type { ReservationSubmission } from "@/lib/schemas";

export type PricingModel = "legacy" | "capacity_tiers";

export type PricingRule = {
  id: string;
  service_type: ReservationSubmission["serviceType"];
  origin_location_id: string | null;
  destination_location_id: string | null;
  bidirectional: boolean;
  pricing_model: PricingModel;
  vehicle_capacity: number;
  base_amount_minor: number | string;
  included_passengers: number;
  extra_passenger_amount_minor: number | string;
  included_bags_per_passenger: number;
  extra_bag_amount_minor: number | string;
  night_surcharge_minor: number | string;
  day_amount_1_4_minor: number | string | null;
  night_amount_1_4_minor: number | string | null;
  day_amount_5_8_minor: number | string | null;
  night_amount_5_8_minor: number | string | null;
  currency: string;
  priority: number;
  valid_from: string | null;
  valid_to: string | null;
};

export function numeric(value: number | string | null | undefined) {
  return Number(value ?? 0);
}

/** El recargo nocturno aplica de 22:00 a 04:59. */
export function isNightTime(time: string) {
  const hour = Number(time.slice(0, 2));
  return hour >= 22 || hour < 5;
}

export function isRuleValidOn(rule: PricingRule, date: string) {
  return (!rule.valid_from || rule.valid_from <= date) && (!rule.valid_to || rule.valid_to >= date);
}

export function selectRule(
  rules: PricingRule[],
  serviceType: ReservationSubmission["serviceType"],
  originId: string,
  destinationId: string,
  date: string,
) {
  if (serviceType === "a_medida" || serviceType === "transporte_abierto") return null;

  return (
    rules
      .filter((rule) => {
        if (!isRuleValidOn(rule, date)) return false;
        const direct = rule.origin_location_id === originId && rule.destination_location_id === destinationId;
        const reverse =
          rule.bidirectional &&
          rule.origin_location_id === destinationId &&
          rule.destination_location_id === originId;
        return direct || reverse;
      })
      .sort((a, b) => a.priority - b.priority)[0] ?? null
  );
}

/** Reparte pasajeros en grupos que no exceden la capacidad de un vehículo. */
export function splitPassengersIntoVans(passengers: number, capacity = 8) {
  const groups: number[] = [];
  let remaining = passengers;
  while (remaining > 0) {
    const group = Math.min(capacity, remaining);
    groups.push(group);
    remaining -= group;
  }
  return groups;
}

export function calculateLeg(rule: PricingRule, passengers: number, bags: number, time: string) {
  const night = isNightTime(time);

  if (rule.pricing_model === "capacity_tiers") {
    const passengerGroups = splitPassengersIntoVans(passengers, rule.vehicle_capacity);
    const groupAmountsMinor = passengerGroups.map((group) => {
      if (group <= 4) {
        return numeric(night ? rule.night_amount_1_4_minor : rule.day_amount_1_4_minor);
      }
      return numeric(night ? rule.night_amount_5_8_minor : rule.day_amount_5_8_minor);
    });
    const totalMinor = groupAmountsMinor.reduce((sum, amount) => sum + amount, 0);

    return {
      totalMinor,
      snapshot: {
        pricingRuleId: rule.id,
        pricingModel: rule.pricing_model,
        period: night ? "night_22_00_to_05_00" : "day_05_00_to_22_00",
        passengerGroups,
        groupAmountsMinor,
        vehicleCount: passengerGroups.length,
      },
    };
  }

  const base = numeric(rule.base_amount_minor);
  const extraPassengers = Math.max(0, passengers - rule.included_passengers);
  const extraPassengerCost = extraPassengers * numeric(rule.extra_passenger_amount_minor);
  const includedBags = passengers * rule.included_bags_per_passenger;
  const extraBags = Math.max(0, bags - includedBags);
  const extraBagCost = extraBags * numeric(rule.extra_bag_amount_minor);
  const nightSurcharge = night ? numeric(rule.night_surcharge_minor) : 0;
  const totalMinor = base + extraPassengerCost + extraBagCost + nightSurcharge;

  return {
    totalMinor,
    snapshot: {
      pricingRuleId: rule.id,
      pricingModel: rule.pricing_model,
      baseAmountMinor: base,
      includedPassengers: rule.included_passengers,
      extraPassengers,
      extraPassengerAmountMinor: numeric(rule.extra_passenger_amount_minor),
      extraPassengerCostMinor: extraPassengerCost,
      includedBags,
      extraBags,
      extraBagAmountMinor: numeric(rule.extra_bag_amount_minor),
      extraBagCostMinor: extraBagCost,
      nightSurchargeMinor: nightSurcharge,
      vehicleCount: Math.ceil(passengers / Math.max(1, rule.vehicle_capacity)),
    },
  };
}
