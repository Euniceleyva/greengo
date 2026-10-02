export interface DirectionalFareTier {
  day1To4: number;
  night1To4: number;
  day5To8: number;
  night5To8: number;
}

export interface PublicFareLeg {
  amount: number;
  isNight: boolean;
  passengerGroups: number[];
  groupAmounts: number[];
}

export interface PublicFareQuote {
  currency: "MXN";
  total: number;
  vehicleCount: number;
  departure: PublicFareLeg;
  returnLeg?: PublicFareLeg;
}

const DIRECTIONAL_FARES: Record<string, DirectionalFareTier> = {
  "loc-aeropuerto>loc-zona-hotelera": { day1To4: 700, night1To4: 850, day5To8: 950, night5To8: 1100 },
  "loc-zona-hotelera>loc-aeropuerto": { day1To4: 750, night1To4: 900, day5To8: 1000, night5To8: 1150 },
  "loc-aeropuerto>loc-puerto-juarez": { day1To4: 800, night1To4: 950, day5To8: 1050, night5To8: 1200 },
  "loc-puerto-juarez>loc-aeropuerto": { day1To4: 850, night1To4: 1000, day5To8: 1200, night5To8: 1350 },
  "loc-aeropuerto>loc-costa-mujeres": { day1To4: 1300, night1To4: 1450, day5To8: 1550, night5To8: 1700 },
  "loc-costa-mujeres>loc-aeropuerto": { day1To4: 1350, night1To4: 1500, day5To8: 1600, night5To8: 1750 },
  "loc-aeropuerto>loc-playa-mujeres": { day1To4: 1300, night1To4: 1450, day5To8: 1550, night5To8: 1700 },
  "loc-playa-mujeres>loc-aeropuerto": { day1To4: 1350, night1To4: 1500, day5To8: 1600, night5To8: 1750 },
  "loc-aeropuerto>loc-bahia-petempich": { day1To4: 700, night1To4: 850, day5To8: 950, night5To8: 1100 },
  "loc-bahia-petempich>loc-aeropuerto": { day1To4: 750, night1To4: 900, day5To8: 1000, night5To8: 1150 },
  "loc-aeropuerto>loc-crococun": { day1To4: 800, night1To4: 950, day5To8: 1050, night5To8: 1200 },
  "loc-crococun>loc-aeropuerto": { day1To4: 850, night1To4: 1000, day5To8: 1100, night5To8: 1250 },
  "loc-aeropuerto>loc-puerto-morelos": { day1To4: 800, night1To4: 950, day5To8: 1050, night5To8: 1200 },
  "loc-puerto-morelos>loc-aeropuerto": { day1To4: 850, night1To4: 1000, day5To8: 1100, night5To8: 1250 },
  "loc-aeropuerto>loc-zona-2": { day1To4: 1200, night1To4: 1350, day5To8: 1450, night5To8: 1600 },
  "loc-zona-2>loc-aeropuerto": { day1To4: 1250, night1To4: 1400, day5To8: 1500, night5To8: 1650 },
  "loc-aeropuerto>loc-riviera-maya-norte": { day1To4: 1300, night1To4: 1450, day5To8: 1550, night5To8: 1700 },
  "loc-riviera-maya-norte>loc-aeropuerto": { day1To4: 1350, night1To4: 1500, day5To8: 1600, night5To8: 1750 },
  "loc-aeropuerto>loc-playa-carmen": { day1To4: 1400, night1To4: 1550, day5To8: 1650, night5To8: 1800 },
  "loc-playa-carmen>loc-aeropuerto": { day1To4: 1450, night1To4: 1600, day5To8: 1700, night5To8: 1850 },
  "loc-aeropuerto>loc-xcaret": { day1To4: 1400, night1To4: 1550, day5To8: 1650, night5To8: 1800 },
  "loc-xcaret>loc-aeropuerto": { day1To4: 1450, night1To4: 1600, day5To8: 1700, night5To8: 1850 },
  "loc-aeropuerto>loc-puerto-aventuras": { day1To4: 1600, night1To4: 1750, day5To8: 1850, night5To8: 2000 },
  "loc-puerto-aventuras>loc-aeropuerto": { day1To4: 1650, night1To4: 1800, day5To8: 1900, night5To8: 2050 },
  "loc-aeropuerto>loc-akumal": { day1To4: 2000, night1To4: 2150, day5To8: 2250, night5To8: 2400 },
  "loc-akumal>loc-aeropuerto": { day1To4: 2050, night1To4: 2200, day5To8: 2300, night5To8: 2450 },
  "loc-aeropuerto>loc-tulum": { day1To4: 2500, night1To4: 2650, day5To8: 2750, night5To8: 2900 },
  "loc-tulum>loc-aeropuerto": { day1To4: 2550, night1To4: 2700, day5To8: 2800, night5To8: 2950 },
};

export function getCancunToday() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Cancun",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

export function isPublicNightTime(time: string) {
  const hour = Number(time.slice(0, 2));
  return Number.isFinite(hour) && (hour >= 22 || hour < 5);
}

export function splitPublicPassengers(passengers: number, capacity = 8) {
  const groups: number[] = [];
  let remaining = Math.max(1, Math.floor(passengers));
  while (remaining > 0) {
    const group = Math.min(capacity, remaining);
    groups.push(group);
    remaining -= group;
  }
  return groups;
}

function calculateLeg(origin: string, destination: string, passengers: number, time: string): PublicFareLeg | null {
  const tier = DIRECTIONAL_FARES[`${origin}>${destination}`];
  if (!tier) return null;
  const isNight = isPublicNightTime(time);
  const passengerGroups = splitPublicPassengers(passengers);
  const groupAmounts = passengerGroups.map((group) => {
    if (group <= 4) return isNight ? tier.night1To4 : tier.day1To4;
    return isNight ? tier.night5To8 : tier.day5To8;
  });
  return {
    amount: groupAmounts.reduce((sum, amount) => sum + amount, 0),
    isNight,
    passengerGroups,
    groupAmounts,
  };
}

export function getPublicFareQuote(input: {
  originLocationId: string;
  destinationLocationId: string;
  passengers: number;
  time: string;
  direction?: "sencillo" | "redondo";
  returnTime?: string;
}): PublicFareQuote | null {
  const departure = calculateLeg(
    input.originLocationId,
    input.destinationLocationId,
    input.passengers,
    input.time,
  );
  if (!departure) return null;

  const returnLeg = input.direction === "redondo"
    ? calculateLeg(
        input.destinationLocationId,
        input.originLocationId,
        input.passengers,
        input.returnTime || input.time,
      )
    : null;
  if (input.direction === "redondo" && !returnLeg) return null;

  return {
    currency: "MXN",
    total: departure.amount + (returnLeg?.amount ?? 0),
    vehicleCount: departure.passengerGroups.length,
    departure,
    ...(returnLeg ? { returnLeg } : {}),
  };
}
