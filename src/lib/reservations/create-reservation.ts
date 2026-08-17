import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
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
  base_amount_minor: number | string;
  included_passengers: number;
  extra_passenger_amount_minor: number | string;
  included_bags_per_passenger: number;
  extra_bag_amount_minor: number | string;
  night_surcharge_minor: number | string;
  hourly_amount_minor: number | string | null;
  minimum_hours: number | null;
  round_trip_multiplier: number | string;
  currency: string;
  priority: number;
};

function numeric(value: number | string | null | undefined) {
  return Number(value ?? 0);
}

function isNightTime(time: string) {
  const hour = Number(time.slice(0, 2));
  return hour >= 22 || hour < 6;
}

function selectRule(
  rules: DbPricingRule[],
  serviceType: ReservationSubmission["serviceType"],
  originId: string,
  destinationId: string,
) {
  if (serviceType === "a_medida" || serviceType === "transporte_abierto") return null;

  return (
    rules
      .filter((rule) => {
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

function calculatePrice(rule: DbPricingRule, input: ReservationSubmission) {
  const base = numeric(rule.base_amount_minor);
  const extraPassengers = Math.max(0, input.passengers - rule.included_passengers);
  const extraPassengerCost = extraPassengers * numeric(rule.extra_passenger_amount_minor);
  const includedBags = input.passengers * rule.included_bags_per_passenger;
  const extraBags = Math.max(0, input.bags - includedBags);
  const extraBagCost = extraBags * numeric(rule.extra_bag_amount_minor);
  const nightSurcharge = isNightTime(input.time) ? numeric(rule.night_surcharge_minor) : 0;
  const oneWaySubtotal = base + extraPassengerCost + extraBagCost + nightSurcharge;
  const multiplier = input.direction === "redondo" ? numeric(rule.round_trip_multiplier) : 1;
  const total = Math.round(oneWaySubtotal * multiplier);

  return {
    subtotalMinor: total,
    totalMinor: total,
    snapshot: {
      pricingRuleId: rule.id,
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
      roundTripMultiplier: multiplier,
      currency: rule.currency,
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

  if (!origin || !destination) {
    throw new Error("Una de las ubicaciones seleccionadas ya no está disponible.");
  }

  const { data: rules, error: rulesError } = await supabase
    .from("pricing_rules")
    .select(
      "id, service_type, origin_location_id, destination_location_id, bidirectional, base_amount_minor, included_passengers, extra_passenger_amount_minor, included_bags_per_passenger, extra_bag_amount_minor, night_surcharge_minor, hourly_amount_minor, minimum_hours, round_trip_multiplier, currency, priority",
    )
    .eq("service_type", input.serviceType)
    .eq("active", true)
    .or(`valid_from.is.null,valid_from.lte.${input.date}`)
    .or(`valid_to.is.null,valid_to.gte.${input.date}`);

  if (rulesError) throw rulesError;

  const rule = selectRule((rules as DbPricingRule[] | null) ?? [], input.serviceType, origin.id, destination.id);
  const requiresQuote = !rule;
  const price = rule
    ? calculatePrice(rule, input)
    : { subtotalMinor: 0, totalMinor: 0, snapshot: { reason: "missing_approved_pricing_rule" } };
  const status = requiresQuote ? "quote_requested" : "awaiting_payment";

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
    destination_location_id: destination.id,
    destination_code: destination.code,
    destination_name: destination.name,
    destination_latitude: numeric(destination.latitude),
    destination_longitude: numeric(destination.longitude),
    service_date: input.date,
    pickup_time: input.time,
    passengers: input.passengers,
    bags: input.bags,
    flight_number: input.flightNumber || null,
    hotel: input.hotel || null,
    customer_notes: input.notes || null,
    currency: rule?.currency ?? "MXN",
    subtotal_minor: price.subtotalMinor,
    discount_minor: 0,
    total_minor: price.totalMinor,
    requires_quote: requiresQuote,
    pricing_rule_id: rule?.id ?? null,
    pricing_snapshot: price.snapshot,
  };

  const { data, error } = await supabase
    .from("reservations")
    .insert(reservation)
    .select("folio, public_reference, status, requires_quote, total_minor, currency")
    .single();

  if (error) {
    if (error.code === "23505") return createReservation(input);
    throw error;
  }

  return {
    folio: data.folio,
    publicReference: data.public_reference,
    status: data.status,
    requiresQuote: data.requires_quote,
    amountMinor: numeric(data.total_minor),
    currency: data.currency,
  };
}
