import type { Destination } from "@/types";

// Destinos destacados para la Landing Page. Extienden (no duplican) los
// lugares definidos en src/mocks/locations.ts — cada destino referencia su
// `locationId` en LOCATIONS. Descripciones, tiempos y precios son ficticios.
export const DESTINATIONS: Destination[] = [
  {
    slug: "zona-hotelera",
    locationId: "loc-zona-hotelera",
    name: "Zona Hotelera de Cancún",
    shortDescription: "Playas turquesa y la vida nocturna más animada del Caribe mexicano.",
    description:
      "La franja hotelera de Cancún concentra los resorts más reconocidos, playas de arena blanca y una oferta interminable de restaurantes, bares y vida nocturna. Ideal para quienes buscan comodidad y todo cerca.",
    image: "/images/destinations/cancun.webp",
    airportMinutes: 25,
    priceFrom: 850,
    highlights: ["A minutos del aeropuerto", "Playas de acceso público", "Centros comerciales y vida nocturna"],
  },
  {
    slug: "playa-del-carmen",
    locationId: "loc-playa-carmen",
    name: "Playa del Carmen",
    shortDescription: "Ambiente bohemio, la Quinta Avenida y acceso a Cozumel en ferry.",
    description:
      "A poco más de una hora de Cancún, Playa del Carmen combina playas relajadas con la energía de la Quinta Avenida, llena de tiendas, cafés y restaurantes. Punto de partida habitual para excursiones a Cozumel.",
    image: "/images/destinations/playa.webp",
    airportMinutes: 60,
    priceFrom: 1450,
    highlights: ["Quinta Avenida peatonal", "Ferry a Cozumel", "Gran variedad gastronómica"],
  },
  {
    slug: "tulum",
    locationId: "loc-tulum",
    name: "Tulum",
    shortDescription: "Ruinas frente al mar, cenotes y un estilo de vida bohemio-chic.",
    description:
      "Tulum es famoso por sus ruinas mayas con vista al Caribe, sus cenotes cercanos y una zona hotelera de diseño relajado. Uno de los destinos más solicitados de la Riviera Maya.",
    image: "/images/destinations/tulum.webp",
    airportMinutes: 120,
    priceFrom: 2200,
    highlights: ["Zona arqueológica frente al mar", "Cenotes cercanos", "Hoteles boutique"],
  },
  {
    slug: "isla-mujeres",
    locationId: "loc-isla-mujeres",
    name: "Isla Mujeres",
    shortDescription: "Una isla pequeña con playas tranquilas a un corto trayecto en ferry.",
    description:
      "Frente a Cancún, Isla Mujeres ofrece playas tranquilas de aguas poco profundas, un pueblo colorido y paseos en golf cart. Traslado terrestre hasta el embarcadero, cruce en ferry no incluido.",
    image: "/images/destinations/isla.webp",
    airportMinutes: 45,
    priceFrom: 1100,
    highlights: ["Playas de aguas calmas", "Ideal para un día completo", "Pueblo caminable"],
  },
  {
    slug: "cozumel",
    locationId: "loc-cozumel",
    name: "Cozumel",
    shortDescription: "Uno de los mejores puntos de buceo y esnórquel del Caribe.",
    description:
      "Cozumel es reconocida mundialmente por sus arrecifes de coral, ideales para buceo y esnórquel. Traslado terrestre hasta el puerto de embarque; el cruce en ferry se contrata por separado.",
    image: "/images/destinations/akumal.webp",
    airportMinutes: 90,
    priceFrom: 1800,
    highlights: ["Arrecifes de coral protegidos", "Buceo y esnórquel", "Pueblo con muelle turístico"],
  },
  {
    slug: "xcaret",
    locationId: "loc-xcaret",
    name: "Xcaret",
    shortDescription: "Parque temático natural con ríos subterráneos y cultura mexicana.",
    description:
      "Xcaret combina naturaleza, ríos subterráneos, vida silvestre y espectáculos culturales en un solo parque. Una de las excursiones de un día más solicitadas desde Cancún.",
    image: "/images/destinations/pventuras.webp",
    airportMinutes: 75,
    priceFrom: 1600,
    highlights: ["Ríos subterráneos", "Espectáculos culturales", "Ideal para excursión de un día"],
  },
];

export function destinationBySlug(slug: string): Destination | undefined {
  return DESTINATIONS.find((d) => d.slug === slug);
}
