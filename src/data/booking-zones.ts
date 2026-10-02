export interface BookingHotel {
  id: string;
  name: string;
}

export interface BookingZone {
  id: string;
  name: string;
  category: "aeropuerto" | "hotel" | "puerto" | "destino" | "terminal";
  coord: [number, number];
  hotels: BookingHotel[];
}

const otherHotel = (zoneId: string): BookingHotel => ({
  id: `${zoneId}-otro`,
  name: "Otro hotel o alojamiento de esta zona",
});

// Catálogo normalizado del “Tarifario cliente directo” (29/07/2026).
// Los nombres corrigen únicamente errores ortográficos evidentes del PDF.
export const BOOKING_ZONES: BookingZone[] = [
  {
    id: "loc-aeropuerto",
    name: "Aeropuerto Internacional de Cancún",
    category: "aeropuerto",
    coord: [21.0417, -86.874],
    hotels: [],
  },
  {
    id: "loc-zona-hotelera",
    name: "Cancún centro y Zona Hotelera",
    category: "hotel",
    coord: [21.1329, -86.7466],
    hotels: [otherHotel("loc-zona-hotelera")],
  },
  {
    id: "loc-puerto-juarez",
    name: "Ferry Puerto Juárez y Punta Sam",
    category: "terminal",
    coord: [21.1858, -86.7975],
    hotels: [otherHotel("loc-puerto-juarez")],
  },
  {
    id: "loc-costa-mujeres",
    name: "Zona Costa Mujeres",
    category: "hotel",
    coord: [21.2327, -86.8024],
    hotels: [
      { id: "hotel-grand-palladium-costa-mujeres", name: "Grand Palladium Costa Mujeres Resort & Spa" },
      { id: "hotel-trs-coral", name: "TRS Coral Hotel" },
      { id: "hotel-riu-latino", name: "Riu Latino" },
      { id: "hotel-majestic-mirage-costa-mujeres", name: "Majestic Mirage Costa Mujeres" },
      { id: "hotel-majestic-elegance-costa-mujeres", name: "Majestic Elegance Costa Mujeres" },
      { id: "hotel-catalonia-grand-costa-mujeres", name: "Catalonia Grand Costa Mujeres" },
      { id: "hotel-allure-costa-mujeres", name: "Allure Costa Mujeres" },
      { id: "hotel-secrets-playa-blanca", name: "Secrets Playa Blanca Costa Mujeres" },
      { id: "hotel-planet-hollywood-cancun", name: "Planet Hollywood Cancún" },
      { id: "hotel-riu-dunamar", name: "Riu Dunamar" },
      { id: "hotel-riu-palace-costa-mujeres", name: "Riu Palace Costa Mujeres" },
      otherHotel("loc-costa-mujeres"),
    ],
  },
  {
    id: "loc-playa-mujeres",
    name: "Zona Playa Mujeres",
    category: "hotel",
    coord: [21.2451, -86.8039],
    hotels: [
      { id: "hotel-beloved-playa-mujeres", name: "Beloved Playa Mujeres" },
      { id: "hotel-excellence-playa-mujeres", name: "Excellence Playa Mujeres" },
      { id: "hotel-finest-playa-mujeres", name: "Finest Playa Mujeres" },
      { id: "hotel-atelier-playa-mujeres", name: "Atelier Playa Mujeres" },
      { id: "hotel-excellence-coral-playa-mujeres", name: "Excellence Coral Playa Mujeres" },
      { id: "hotel-dreams-playa-mujeres", name: "Dreams Playa Mujeres Golf & Spa Resort" },
      { id: "hotel-secrets-playa-mujeres", name: "Secrets Playa Mujeres Golf & Spa Resort" },
      otherHotel("loc-playa-mujeres"),
    ],
  },
  {
    id: "loc-bahia-petempich",
    name: "Bahía Petempich",
    category: "hotel",
    coord: [20.9065, -86.8505],
    hotels: [
      { id: "hotel-desire-riviera-maya", name: "Desire Riviera Maya Resort" },
      { id: "hotel-margaritaville-riviera-maya", name: "Margaritaville Island Reserve Riviera Maya" },
      { id: "hotel-margaritaville-riviera-cancun", name: "Margaritaville Island Reserve Riviera Cancún" },
      { id: "hotel-breathless-riviera-cancun", name: "Breathless Riviera Cancún Resort & Spa" },
      { id: "hotel-zoetry-paraiso-bonita", name: "Zoëtry Paraíso de la Bonita" },
      { id: "hotel-sensira-riviera-maya", name: "Sensira Resort & Spa Riviera Maya" },
      otherHotel("loc-bahia-petempich"),
    ],
  },
  {
    id: "loc-crococun",
    name: "Zona CrocoCun",
    category: "hotel",
    coord: [20.8481, -86.8757],
    hotels: [
      { id: "hotel-excellence-riviera-cancun", name: "Excellence Riviera Cancún" },
      { id: "hotel-dreams-riviera-cancun-resort-spa", name: "Dreams Riviera Cancún Resort & Spa" },
      { id: "hotel-desire-riviera-maya-pearl-resort", name: "Desire Riviera Maya Pearl Resort" },
      { id: "hotel-dreams-sapphire-riviera-cancun", name: "Dreams Sapphire Resort & Spa" },
      { id: "hotel-ocean-coral-turquesa", name: "Ocean Coral & Turquesa" },
      otherHotel("loc-crococun"),
    ],
  },
  {
    id: "loc-puerto-morelos",
    name: "Zona Puerto Morelos",
    category: "hotel",
    coord: [20.8481, -86.8757],
    hotels: [
      { id: "hotel-the-fives-oceanfront-puerto-morelos", name: "The Fives Oceanfront Puerto Morelos" },
      { id: "hotel-marina-el-cid-spa-beach-resort", name: "Hotel Marina El Cid Spa & Beach Resort" },
      { id: "hotel-dreams-jade-puerto-morelos", name: "Dreams Jade Resort & Spa" },
      { id: "hotel-ventus-at-marina-el-cid-spa-beach", name: "Ventus at Marina El Cid Spa & Beach" },
      { id: "hotel-grand-residences-riviera-cancun", name: "Grand Residences Riviera Cancún" },
      otherHotel("loc-puerto-morelos"),
    ],
  },
  {
    id: "loc-zona-2",
    name: "Zona 2 · Riviera Maya",
    category: "hotel",
    coord: [20.7895, -86.945],
    hotels: [
      { id: "hotel-nickelodeon", name: "Nickelodeon Hotels & Resorts Riviera Maya" },
      { id: "hotel-generations", name: "Generations Riviera Maya" },
      { id: "hotel-el-dorado-royale", name: "El Dorado Royale" },
      { id: "hotel-valentin-imperial", name: "Valentin Imperial Riviera Maya" },
      { id: "hotel-vidanta-riviera-maya", name: "Vidanta Riviera Maya" },
      { id: "hotel-iberostar-paraiso", name: "Iberostar Paraíso" },
      { id: "hotel-maroma-beach", name: "Maroma Beach" },
      { id: "hotel-hacienda-tres-rios", name: "Hacienda Tres Ríos" },
      otherHotel("loc-zona-2"),
    ],
  },
  {
    id: "loc-riviera-maya-norte",
    name: "Riviera Maya Norte · Mayakoba y Xcalacoco",
    category: "hotel",
    coord: [20.6904, -87.034],
    hotels: [
      { id: "hotel-etereo", name: "Etéreo, Auberge Resorts Collection" },
      { id: "hotel-bluebay-esmeralda", name: "BlueBay Grand Esmeralda" },
      { id: "hotel-blue-diamond", name: "Blue Diamond Luxury Boutique Hotel" },
      { id: "hotel-mayakoba", name: "Mayakoba" },
      { id: "hotel-grand-velas-riviera-maya", name: "Grand Velas Riviera Maya" },
      { id: "hotel-riviera-princess", name: "Riviera Princess" },
      { id: "hotel-ocean-riviera-paradise", name: "Ocean Riviera Paradise" },
      { id: "hotel-h10", name: "Hoteles H10 de la zona" },
      { id: "hotel-xcalacoco", name: "Zona Xcalacoco" },
      { id: "hotel-sandos-caracol", name: "Sandos Caracol Eco Resort" },
      { id: "hotel-royal-haciendas", name: "The Royal Haciendas" },
      otherHotel("loc-riviera-maya-norte"),
    ],
  },
  {
    id: "loc-playa-carmen",
    name: "Playa del Carmen centro y Playacar",
    category: "destino",
    coord: [20.6296, -87.0739],
    hotels: [otherHotel("loc-playa-carmen")],
  },
  {
    id: "loc-xcaret",
    name: "Zona Xcaret",
    category: "destino",
    coord: [20.5808, -87.1189],
    hotels: [otherHotel("loc-xcaret")],
  },
  {
    id: "loc-puerto-aventuras",
    name: "Zona Puerto Aventuras y Kantenah",
    category: "hotel",
    coord: [20.5003, -87.2264],
    hotels: [
      { id: "hotel-hard-rock-riviera-maya", name: "Hard Rock Hotel Riviera Maya" },
      { id: "hotel-catalonia-riviera-maya", name: "Catalonia Riviera Maya" },
      { id: "hotel-dreams-puerto-aventuras", name: "Dreams Aventuras Riviera Maya" },
      { id: "hotel-catalonia-royal-tulum", name: "Catalonia Royal Tulum" },
      { id: "hotel-barcelo-maya", name: "Barceló Maya" },
      { id: "hotel-el-dorado-seaside", name: "El Dorado Seaside Suites · Kantenah" },
      { id: "hotel-grand-palladium-kantenah", name: "Grand Palladium Kantenah" },
      { id: "hotel-grand-sirenis", name: "Grand Sirenis Riviera Maya" },
      otherHotel("loc-puerto-aventuras"),
    ],
  },
  {
    id: "loc-akumal",
    name: "Zona Akumal",
    category: "hotel",
    coord: [20.3974, -87.3142],
    hotels: [
      { id: "hotel-unico-2087", name: "UNICO 20°87° Hotel Riviera Maya" },
      { id: "hotel-secrets-akumal", name: "Secrets Akumal Riviera Maya" },
      { id: "hotel-akumal-bay", name: "Akumal Bay Beach & Wellness Resort" },
      { id: "hotel-bahia-principe", name: "Bahía Príncipe" },
      { id: "hotel-hilton-tulum", name: "Hilton Tulum Riviera Maya" },
      otherHotel("loc-akumal"),
    ],
  },
  {
    id: "loc-tulum",
    name: "Tulum centro y Zona Hotelera",
    category: "destino",
    coord: [20.2114, -87.4654],
    hotels: [otherHotel("loc-tulum")],
  },
];

export const BOOKING_ZONE_OPTIONS = BOOKING_ZONES.map(({ id, name }) => ({ id, name }));
export const HOTEL_BOOKING_ZONES = BOOKING_ZONES.filter((zone) => zone.category !== "aeropuerto");

export function getBookingZone(id: string | null | undefined) {
  return BOOKING_ZONES.find((zone) => zone.id === id);
}

export function isCustomHotelId(zoneId: string, hotelId: string | null | undefined) {
  return hotelId === `${zoneId}-otro`;
}

export function resolveHotelSelection(
  zoneId: string,
  hotelId: string | null | undefined,
  customName: string | null | undefined,
) {
  const zone = getBookingZone(zoneId);
  if (!zone || zone.category === "aeropuerto") return null;

  if (!hotelId) throw new Error(`Selecciona el hotel o alojamiento de ${zone.name}.`);
  const hotel = zone.hotels.find((item) => item.id === hotelId);
  if (!hotel) throw new Error(`El hotel seleccionado no corresponde a ${zone.name}.`);

  if (isCustomHotelId(zoneId, hotelId)) {
    const normalized = customName?.trim();
    if (!normalized || normalized.length < 2) throw new Error(`Escribe el nombre del alojamiento de ${zone.name}.`);
    return { id: hotelId, name: normalized };
  }

  return hotel;
}
