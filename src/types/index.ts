// Tipos centralizados de GreenGo Traslados.

export type LatLng = [number, number];

// ---------------------------------------------------------------------------
// Servicios / viajes
// ---------------------------------------------------------------------------

export type ServiceType =
  | "hotel_hotel"
  | "aeropuerto"
  | "transporte_abierto"
  | "a_medida";

export type VehicleType = "van" | "suburban" | "sedan" | "sprinter" | "autobus";

export type BookingSource = "web" | "admin" | "whatsapp" | "agencia";
export type PaymentStatus = "pendiente" | "parcial" | "pagado" | "cotizacion";

// ---------------------------------------------------------------------------
// Ubicaciones y rutas
// ---------------------------------------------------------------------------

export interface NamedLocation {
  id: string;
  name: string;
  coord: LatLng;
  category: "aeropuerto" | "hotel" | "puerto" | "destino" | "terminal";
}

// ---------------------------------------------------------------------------
// Landing page — destinos
// ---------------------------------------------------------------------------

export interface Destination {
  slug: string;
  locationId: string; // referencia a NamedLocation.id en src/mocks/locations.ts
  name: string;
  shortDescription: string;
  description: string;
  image: string; // placeholder local en /public/images/destinations
  airportMinutes: number; // tiempo estimado desde el aeropuerto de Cancún
  priceFrom: number; // MXN, tarifa "desde" (traslado sencillo desde el aeropuerto)
  highlights: string[];
}

// ---------------------------------------------------------------------------
// Landing page — testimonios
// ---------------------------------------------------------------------------

export interface Testimonial {
  id: string;
  name: string;
  origin: string; // ciudad/país de origen (ficticio)
  avatarColor: string;
  rating: number; // 1-5
  quote: string;
  serviceType: ServiceType;
}

// ---------------------------------------------------------------------------
// Landing page — preguntas frecuentes
// ---------------------------------------------------------------------------

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

// ---------------------------------------------------------------------------
// Landing page — tarifas mock
// ---------------------------------------------------------------------------

export interface PricingRate {
  id: string;
  originLocationId: string;
  destinationLocationId: string;
  vehicleType: VehicleType;
  basePrice: number; // MXN, incluye hasta 4 pasajeros
  pricePerExtraPassenger: number; // MXN por pasajero adicional
}

// ---------------------------------------------------------------------------
// Landing page — galería
// ---------------------------------------------------------------------------

export interface GalleryImage {
  id: string;
  src: string; // placeholder local en /public/images/gallery
  alt: string;
  width: number;
  height: number;
}

// ---------------------------------------------------------------------------
// Chatbot guiado (sin IA, árbol de decisión con respuestas predefinidas)
// ---------------------------------------------------------------------------

export type ChatbotAction =
  | { kind: "node"; nodeId: string }
  | { kind: "whatsapp" }
  | { kind: "link"; href: string };

export interface ChatbotOption {
  id: string;
  label: string;
  labelEn: string;
  action: ChatbotAction;
}

export interface ChatbotNode {
  id: string;
  message: string;
  messageEn: string;
  options: ChatbotOption[];
}

// ---------------------------------------------------------------------------
// Formulario de reserva multi-paso (/reservar)
// ---------------------------------------------------------------------------

export type TripDirection = "sencillo" | "redondo";

// ---------------------------------------------------------------------------
// Mini-cotizador (Landing Page — hero)
// ---------------------------------------------------------------------------

// Tipo de traslado elegido en el mini-cotizador del hero. Es más granular que
// ServiceType (usado en /reservar): se traduce a ServiceType al continuar con
// la reserva (ver src/mocks/hero-quote.ts).
export type TransferKind = "hotel_hotel" | "hotel_aeropuerto" | "aeropuerto_hotel" | "tour";

// Punto de salida elegido para un traslado tipo "Tour".
export type TourOrigin = "aeropuerto" | "hotel";

export interface HeroQuoteEstimate {
  currency: "MXN" | "USD";
  total: number;
  label: string; // descripción corta del cálculo, p. ej. "Tarifa base + 2 pasajeros extra"
}

export interface ReservationDraft {
  // Paso 1 — Servicio
  serviceType: ServiceType | null;
  originLocationId: string | null;
  destinationLocationId: string | null;
  originHotelId: string;
  originHotelName: string;
  destinationHotelId: string;
  destinationHotelName: string;
  direction: TripDirection;
  // Paso 2 — Detalles
  date: string; // yyyy-MM-dd
  time: string; // HH:mm
  returnDate: string;
  returnTime: string;
  passengers: number;
  bags: number;
  flightNumber: string;
  notes: string;
  // Paso 3 — Contacto
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  hotel: string;
}

export interface ReservationReceipt {
  folio: string;
  publicReference: string;
  status: "quote_requested" | "awaiting_payment";
  requiresQuote: boolean;
  amountMinor: number;
  currency: string;
}
