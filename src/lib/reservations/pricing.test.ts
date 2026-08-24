import { describe, expect, it } from "vitest";
import {
  calculateLeg,
  isNightTime,
  isRuleValidOn,
  selectRule,
  splitPassengersIntoVans,
  type PricingRule,
} from "./pricing";

function legacyRule(overrides: Partial<PricingRule> = {}): PricingRule {
  return {
    id: "rule-1",
    service_type: "hotel_hotel",
    origin_location_id: "origin",
    destination_location_id: "destination",
    bidirectional: true,
    pricing_model: "legacy",
    vehicle_capacity: 8,
    base_amount_minor: 100_000,
    included_passengers: 4,
    extra_passenger_amount_minor: 10_000,
    included_bags_per_passenger: 2,
    extra_bag_amount_minor: 5_000,
    night_surcharge_minor: 20_000,
    day_amount_1_4_minor: null,
    night_amount_1_4_minor: null,
    day_amount_5_8_minor: null,
    night_amount_5_8_minor: null,
    currency: "MXN",
    priority: 100,
    valid_from: null,
    valid_to: null,
    ...overrides,
  };
}

describe("isNightTime", () => {
  it("treats 22:00-04:59 as night", () => {
    expect(isNightTime("22:00")).toBe(true);
    expect(isNightTime("23:59")).toBe(true);
    expect(isNightTime("00:00")).toBe(true);
    expect(isNightTime("04:59")).toBe(true);
  });

  it("treats 05:00-21:59 as day", () => {
    expect(isNightTime("05:00")).toBe(false);
    expect(isNightTime("12:00")).toBe(false);
    expect(isNightTime("21:59")).toBe(false);
  });
});

describe("splitPassengersIntoVans", () => {
  it("keeps a single group under capacity", () => {
    expect(splitPassengersIntoVans(4, 8)).toEqual([4]);
  });

  it("splits exactly at capacity boundaries", () => {
    expect(splitPassengersIntoVans(8, 8)).toEqual([8]);
    expect(splitPassengersIntoVans(9, 8)).toEqual([8, 1]);
    expect(splitPassengersIntoVans(16, 8)).toEqual([8, 8]);
  });

  it("handles passengers below capacity of 1", () => {
    expect(splitPassengersIntoVans(3, 1)).toEqual([1, 1, 1]);
  });
});

describe("isRuleValidOn", () => {
  it("is valid with no date bounds", () => {
    expect(isRuleValidOn(legacyRule(), "2026-01-01")).toBe(true);
  });

  it("rejects dates before valid_from", () => {
    expect(isRuleValidOn(legacyRule({ valid_from: "2026-02-01" }), "2026-01-01")).toBe(false);
  });

  it("rejects dates after valid_to", () => {
    expect(isRuleValidOn(legacyRule({ valid_to: "2026-01-31" }), "2026-02-01")).toBe(false);
  });
});

describe("selectRule", () => {
  const rules = [legacyRule({ id: "a", priority: 200 }), legacyRule({ id: "b", priority: 50 })];

  it("returns null for transporte_abierto and a_medida (siempre requieren cotización)", () => {
    expect(selectRule(rules, "transporte_abierto", "origin", "destination", "2026-01-01")).toBeNull();
    expect(selectRule(rules, "a_medida", "origin", "destination", "2026-01-01")).toBeNull();
  });

  it("matches direct origin/destination pairs and picks the lowest priority value", () => {
    const rule = selectRule(rules, "hotel_hotel", "origin", "destination", "2026-01-01");
    expect(rule?.id).toBe("b");
  });

  it("matches the reverse direction when bidirectional", () => {
    const rule = selectRule(rules, "hotel_hotel", "destination", "origin", "2026-01-01");
    expect(rule?.id).toBe("b");
  });

  it("ignores the reverse direction when not bidirectional", () => {
    const oneWay = [legacyRule({ id: "one-way", bidirectional: false })];
    expect(selectRule(oneWay, "hotel_hotel", "destination", "origin", "2026-01-01")).toBeNull();
  });

  it("returns null when no rule matches the route", () => {
    expect(selectRule(rules, "hotel_hotel", "origin", "somewhere-else", "2026-01-01")).toBeNull();
  });
});

describe("calculateLeg — legacy pricing model", () => {
  it("charges only the base amount within included passengers/bags, no night surcharge", () => {
    const result = calculateLeg(legacyRule(), 4, 8, "12:00");
    expect(result.totalMinor).toBe(100_000);
  });

  it("adds extra passenger and extra bag costs", () => {
    // 6 passengers (2 over 4 included) x 10_000 = 20_000 extra
    // included bags = 6 * 2 = 12; 14 bags -> 2 extra x 5_000 = 10_000
    const result = calculateLeg(legacyRule(), 6, 14, "12:00");
    expect(result.totalMinor).toBe(100_000 + 20_000 + 10_000);
  });

  it("adds the night surcharge only for night times", () => {
    const day = calculateLeg(legacyRule(), 4, 8, "12:00");
    const night = calculateLeg(legacyRule(), 4, 8, "23:00");
    expect(night.totalMinor - day.totalMinor).toBe(20_000);
  });

  it("never charges negative extras when under the included amounts", () => {
    const result = calculateLeg(legacyRule(), 1, 0, "12:00");
    expect(result.totalMinor).toBe(100_000);
    expect(result.snapshot.extraPassengerCostMinor).toBe(0);
    expect(result.snapshot.extraBagCostMinor).toBe(0);
  });
});

describe("calculateLeg — capacity_tiers pricing model", () => {
  const tieredRule = legacyRule({
    pricing_model: "capacity_tiers",
    vehicle_capacity: 8,
    day_amount_1_4_minor: 80_000,
    night_amount_1_4_minor: 100_000,
    day_amount_5_8_minor: 140_000,
    night_amount_5_8_minor: 160_000,
  });

  it("charges the 1-4 tier for small groups", () => {
    const result = calculateLeg(tieredRule, 3, 4, "12:00");
    expect(result.totalMinor).toBe(80_000);
  });

  it("charges the 5-8 tier for larger single-van groups", () => {
    const result = calculateLeg(tieredRule, 6, 6, "12:00");
    expect(result.totalMinor).toBe(140_000);
  });

  it("splits into multiple vans and sums each group's tier", () => {
    // 12 passengers -> vans of 8 and 4 -> 140_000 (5-8) + 80_000 (1-4)
    const result = calculateLeg(tieredRule, 12, 10, "12:00");
    expect(result.totalMinor).toBe(140_000 + 80_000);
    expect(result.snapshot.vehicleCount).toBe(2);
  });

  it("uses night tier amounts at night", () => {
    const result = calculateLeg(tieredRule, 3, 4, "23:30");
    expect(result.totalMinor).toBe(100_000);
  });
});
