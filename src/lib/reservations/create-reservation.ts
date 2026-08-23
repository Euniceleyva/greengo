import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { resolveHotelSelection } from "@/data/booking-zones";
import { enqueueReservationNotifications } from "@/lib/notifications/queue";
import type { ReservationSubmission } from "@/lib/schemas";
import type { ReservationReceipt } from "@/types";

type DbLocation = {
  id: string;
  code: string;
  name: string;
  latitude: number | string;
  longitude: number | string;
};

type DbPricingRule = {
  id: string;
  service_type: ReservationSubmission["serviceType"];
  origin_location_id: string | null;
  destination_location_id: string | null;
  bidirectional: boolean;
  pricing_model: "legacy" | "capacity_tiers";
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

function numeric(value: number | string | null | undefined) {
  return Number(value ?? 0);
}

export function isNightTime(time: string) {
  const hour = Number(time.slice(0, 2));
  return hour >= 22 || hour < 5;
}

function isRuleValidOn(rule: DbPricingRule, date: string) {
  return (!rule.valid_from || rule.valid_from <= date) && (!rule.valid_to || rule.valid_to >= date);
}

function selectRule(
  rules: DbPricingRule[],
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

function calculateLeg(rule: DbPricingRule, passengers: number, bags: number, time: string) {
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

export async function createReservation(input: ReservationSubmission): Promise<ReservationReceipt> {
  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("reservations")
    .select("folio, public_reference, status, requires_quote, total_minor, currency")
    .eq("submission_key", input.submissionKey)
    .maybeSingle();

  if (existing) {
    return {
      folio: existing.folio,
      publicReference: existing.public_reference,
      status: existing.status,
      requiresQuote: existing.requires_quote,
      amountMinor: numeric(existing.total_minor),
      currency: existing.currency,
    };
  }

  const { data: locations, error: locationsError } = await supabase
    .from("locations")
    .select("id, code, name, latitude, longitude")
    .in("code", [input.originLocationId, input.destinationLocationId])
    .eq("active", true);

  if (locationsError) throw locationsError;

  const locationMap = new Map((locations as DbLocation[] | null)?.map((location) => [location.code, location]));
  const origin = locationMap.get(input.originLocationId);
  const destination = locationMap.get(input.destinationLocationId);
  if (!origin || !destination) throw new Error("Una de las ubicaciones seleccionadas ya no está disponible.");

  const originHotel = resolveHotelSelection(origin.code, input.originHotelId, input.originHotelName);
  const destinationHotel = resolveHotelSelection(
    destination.code,
    input.destinationHotelId,
    input.destinationHotelName,
  );

  const { data: rules, error: rulesError } = await supabase
    .from("pricing_rules")
    .select(
      "id, service_type, origin_location_id, destination_location_id, bidirectional, pricing_model, vehicle_capacity, base_amount_minor, included_passengers, extra_passenger_amount_minor, included_bags_per_passenger, extra_bag_amount_minor, night_surcharge_minor, day_amount_1_4_minor, night_amount_1_4_minor, day_amount_5_8_minor, night_amount_5_8_minor, currency, priority, valid_from, valid_to",
    )
    .eq("service_type", input.serviceType)
    .eq("active", true);
  if (rulesError) throw rulesError;

  const availableRules = (rules as DbPricingRule[] | null) ?? [];
  const departureRule = selectRule(availableRules, input.serviceType, origin.id, destination.id, input.date);
  const returnRule =
    input.direction === "redondo"
      ? selectRule(
          availableRules,
          input.serviceType,
          destination.id,
          origin.id,
          input.returnDate,
        )
      : null;
  const requiresQuote = !departureRule || (input.direction === "redondo" && !returnRule);

  let subtotalMinor = 0;
  let snapshot: Record<string, unknown> = { reason: "missing_approved_pricing_rule" };
  if (!requiresQuote && departureRule) {
    const departure = calculateLeg(departureRule, input.passengers, input.bags, input.time);
    const returnLeg =
      input.direction === "redondo" && returnRule
        ? calculateLeg(returnRule, input.passengers, input.bags, input.returnTime)
        : null;
    subtotalMinor = departure.totalMinor + (returnLeg?.totalMinor ?? 0);
    snapshot = {
      calculation: "sum_of_directional_legs",
      passengers: input.passengers,
      vehicleCount: Math.ceil(input.passengers / 8),
      departure: departure.snapshot,
      ...(returnLeg ? { return: returnLeg.snapshot } : {}),
      currency: departureRule.currency,
    };
  }

  const status = requiresQuote ? "quote_requested" : "awaiting_payment";
  const vehicleCount = Math.ceil(input.passengers / 8);
  const reservation = {
    submission_key: input.submissionKey,
    service_type: input.serviceType,
    direction: input.direction,
    booking_source: "web",
    status,
    contact_name: input.contactName.trim(),
    contact_email: input.contactEmail.trim().toLowerCase(),
    contact_phone: input.contactPhone.trim(),
    origin_location_id: origin.id,
    origin_code: origin.code,
    origin_name: origin.name,
    origin_latitude: numeric(origin.latitude),
    origin_longitude: numeric(origin.longitude),
    origin_hotel_code: originHotel?.id ?? null,
    origin_hotel_name: originHotel?.name ?? null,
    destination_location_id: destination.id,
    destination_code: destination.code,
    destination_name: destination.name,
    destination_latitude: numeric(destination.latitude),
    destination_longitude: numeric(destination.longitude),
    destination_hotel_code: destinationHotel?.id ?? null,
    destination_hotel_name: destinationHotel?.name ?? null,
    service_date: input.date,
    pickup_time: input.time,
    return_date: input.direction === "redondo" ? input.returnDate : null,
    return_time: input.direction === "redondo" ? input.returnTime : null,
    passengers: input.passengers,
    vehicle_count: vehicleCount,
    bags: input.bags,
    flight_number: input.flightNumber || null,
    hotel: input.hotel || destinationHotel?.name || originHotel?.name || null,
    customer_notes: input.notes || null,
    currency: departureRule?.currency ?? "MXN",
    subtotal_minor: subtotalMinor,
    discount_minor: 0,
    total_minor: subtotalMinor,
    requires_quote: requiresQuote,
    pricing_rule_id: departureRule?.id ?? null,
    pricing_snapshot: snapshot,
  };

  const { data, error } = await supabase
    .from("reservations")
    .insert(reservation)
    .select(
      "id, folio, public_reference, status, requires_quote, total_minor, currency, contact_name, contact_email, origin_name, destination_name, service_type, direction, origin_hotel_name, destination_hotel_name, service_date, pickup_time, return_date, return_time, passengers, vehicle_count, bags, flight_number",
    )
    .single();

  if (error) {
    if (error.code === "23505") return createReservation(input);
    throw error;
  }

  await enqueueReservationNotifications(data);

  return {
    folio: data.folio,
    publicReference: data.public_reference,
    status: data.status,
    requiresQuote: data.requires_quote,
    amountMinor: numeric(data.total_minor),
    currency: data.currency,
  };
}
