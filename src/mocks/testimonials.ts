import type { Testimonial } from "@/types";

// Testimonios ficticios para la Landing Page. Ningún dato corresponde a
// personas reales.
export const TESTIMONIALS: Testimonial[] = [
  {
    id: "test-01",
    name: "Mariana Solís",
    origin: "Ciudad de México",
    avatarColor: "#29876B",
    rating: 5,
    quote:
      "El conductor nos esperó en la sala de llegadas con un letrero y nos llevó directo al hotel en Zona Hotelera. Muy puntual y el vehículo impecable.",
    serviceType: "aeropuerto",
  },
  {
    id: "test-02",
    name: "Daniel Herrera",
    origin: "Monterrey",
    avatarColor: "#00AFEE",
    rating: 5,
    quote:
      "Rentamos el transporte por día completo para movernos entre Tulum y los cenotes cercanos. Comodidad total y el chofer conocía muy bien la zona.",
    serviceType: "transporte_abierto",
  },
  {
    id: "test-03",
    name: "Laura Jiménez",
    origin: "Guadalajara",
    avatarColor: "#F68634",
    rating: 4,
    quote:
      "Coordinamos un traslado especial para una boda con recepción de bienvenida para los invitados. Todo salió a tiempo y sin contratiempos.",
    serviceType: "a_medida",
  },
  {
    id: "test-04",
    name: "Robert Anderson",
    origin: "Toronto, Canadá",
    avatarColor: "#A8CE46",
    rating: 5,
    quote:
      "Booked a hotel-to-hotel transfer between Cancún and Playa del Carmen. Clean van, professional driver, and easy online quote beforehand.",
    serviceType: "hotel_hotel",
  },
  {
    id: "test-05",
    name: "Carla Domínguez",
    origin: "Puebla",
    avatarColor: "#7c3aed",
    rating: 5,
    quote:
      "Viajamos en grupo familiar con niños pequeños y el vehículo tenía espacio de sobra para el equipaje. Excelente comunicación antes del viaje.",
    serviceType: "aeropuerto",
  },
  {
    id: "test-06",
    name: "Sofía Ramírez",
    origin: "Mérida",
    avatarColor: "#dc2626",
    rating: 4,
    quote:
      "Muy buena opción para llegar a Xcaret sin depender de tours. El conductor nos recogió puntual de regreso al hotel.",
    serviceType: "aeropuerto",
  },
];
