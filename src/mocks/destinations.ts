import type { Destination } from "@/types";

// Destinos destacados para la Landing Page. Extienden (no duplican) los
// lugares definidos en src/mocks/locations.ts; cada destino referencia su
// `locationId` en LOCATIONS.
export const DESTINATIONS: Destination[] = [
  {
    slug: "zona-hotelera",
    locationId: "loc-zona-hotelera",
    name: "Zona Hotelera de Cancún",
    shortDescription: "Traslado privado desde el Aeropuerto de Cancún a hoteles frente al Caribe mexicano.",
    description:
      "Viaja del Aeropuerto Internacional de Cancún a la Zona Hotelera en una unidad privada, sin filas ni transbordos. Esta franja concentra resorts frente al mar, playas de arena blanca, restaurantes, centros comerciales y vida nocturna, por lo que es una de las rutas más solicitadas para iniciar vacaciones con comodidad.",
    image: "/images/destinations/cancun.webp",
    airportMinutes: 25,
    priceFrom: 850,
    highlights: ["A minutos del aeropuerto", "Playas de acceso público", "Centros comerciales y vida nocturna"],
  },
  {
    slug: "playa-del-carmen",
    locationId: "loc-playa-carmen",
    name: "Playa del Carmen",
    shortDescription: "Transporte privado desde Cancún a Playa del Carmen, Quinta Avenida y ferry a Cozumel.",
    description:
      "Reserva un traslado privado desde el Aeropuerto de Cancún o tu hotel hacia Playa del Carmen. La ruta conecta con resorts, la Quinta Avenida, restaurantes, beach clubs y la terminal de ferry a Cozumel, ideal para quienes quieren moverse por la Riviera Maya con horario propio.",
    image: "/images/destinations/playa.webp",
    airportMinutes: 60,
    priceFrom: 1450,
    highlights: ["Quinta Avenida peatonal", "Ferry a Cozumel", "Gran variedad gastronómica"],
  },
  {
    slug: "tulum",
    locationId: "loc-tulum",
    name: "Tulum",
    shortDescription: "Traslado privado de Cancún a Tulum, zona hotelera, ruinas y cenotes.",
    description:
      "El traslado de Cancún a Tulum es una de las rutas largas más buscadas de la Riviera Maya. Con GreenGo puedes viajar en transporte privado hacia la zona hotelera, el centro, las ruinas mayas frente al Caribe o cenotes cercanos, con espacio para equipaje y salida ajustada a tu itinerario.",
    image: "/images/destinations/tulum.webp",
    airportMinutes: 120,
    priceFrom: 2200,
    highlights: ["Zona arqueológica frente al mar", "Cenotes cercanos", "Hoteles boutique"],
  },
  {
    slug: "isla-mujeres",
    locationId: "loc-isla-mujeres",
    name: "Isla Mujeres",
    shortDescription: "Transporte privado al ferry de Isla Mujeres desde aeropuerto, hotel o Zona Hotelera.",
    description:
      "Llegar a Isla Mujeres comienza con un traslado terrestre privado al embarcadero de Cancún. Te llevamos desde el aeropuerto o tu hotel hasta la terminal de ferry para que cruces hacia playas tranquilas, el centro de la isla y sus paseos en golf cart. El cruce marítimo se contrata por separado.",
    image: "/images/destinations/isla.webp",
    airportMinutes: 45,
    priceFrom: 1100,
    highlights: ["Playas de aguas calmas", "Ideal para un día completo", "Pueblo caminable"],
  },
  {
    slug: "cozumel",
    locationId: "loc-cozumel",
    name: "Cozumel",
    shortDescription: "Traslado privado a la terminal de ferry a Cozumel desde Cancún o Riviera Maya.",
    description:
      "Para viajar a Cozumel, coordinamos tu transporte privado hasta el puerto de embarque en Playa del Carmen. Es una ruta cómoda desde Cancún, hoteles de la Riviera Maya o el aeropuerto, pensada para conectar con el ferry hacia una isla famosa por arrecifes, buceo y esnórquel.",
    image: "/images/destinations/akumal.webp",
    airportMinutes: 90,
    priceFrom: 1800,
    highlights: ["Arrecifes de coral protegidos", "Buceo y esnórquel", "Pueblo con muelle turístico"],
  },
  {
    slug: "xcaret",
    locationId: "loc-xcaret",
    name: "Xcaret",
    shortDescription: "Transporte privado a Xcaret desde Cancún, Playa del Carmen o tu hotel.",
    description:
      "Evita depender de horarios de tour y reserva transporte privado a Xcaret desde Cancún, Playa del Carmen o cualquier hotel de la Riviera Maya. Te llevamos al parque y podemos coordinar el regreso después de sus ríos subterráneos, actividades naturales y espectáculos culturales.",
    image: "/images/destinations/pventuras.webp",
    airportMinutes: 75,
    priceFrom: 1600,
    highlights: ["Ríos subterráneos", "Espectáculos culturales", "Ideal para excursión de un día"],
  },
];

export function destinationBySlug(slug: string): Destination | undefined {
  return DESTINATIONS.find((d) => d.slug === slug);
}
