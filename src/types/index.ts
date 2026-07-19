// Tipos centralizados del DEMO GreenGo Traslados.
// Todos los datos son simulados (mocks). No representan personas reales.

export type LatLng = [number, number];

// ---------------------------------------------------------------------------
// Usuarios / roles
// ---------------------------------------------------------------------------

export type UserRole = "administrador" | "operador" | "conductor";

export interface DemoUser {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatarColor: string;
  driverId?: string; // si el usuario es conductor, referencia al conductor mock
}

// ---------------------------------------------------------------------------
// Vehículos
// ---------------------------------------------------------------------------

export type VehicleStatus =
  | "disponible"
  | "en_ruta"
  | "detenido"
  | "mantenimiento"
  | "con_alerta";

export type VehicleType = "van" | "suburban" | "sedan" | "sprinter" | "autobus";

export interface Vehicle {
  id: string;
  code: string; // identificador interno, p. ej. "U-01"
  brand: string;
  model: string;
  year: number;
  plates: string;
  capacity: number;
  type: VehicleType;
  status: VehicleStatus;
  odometerKm: number;
  nextMaintenanceKm: number;
  fuelLevel: number; // 0-100 %
  assignedDriverId: string | null;
  lastLocation: LatLng;
  lastLocationName: string;
  speedKmh: number;
  documents: VehicleDocument[];
}

export interface VehicleDocument {
  id: string;
  name: string;
  status: "vigente" | "por_vencer" | "vencido";
  expiresOn: string; // ISO date
}

// ---------------------------------------------------------------------------
// Conductores
// ---------------------------------------------------------------------------

export type DriverStatus = "activo" | "en_servicio" | "descanso" | "inactivo";

export interface Driver {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  licenseExpiresOn: string; // ISO date
  status: DriverStatus;
  assignedVehicleId: string | null;
  completedTrips: number;
  rating: number; // 1-5
  incidents: number;
  drivenKm: number;
  emergencyContact: string;
  emergencyPhone: string;
}

// ---------------------------------------------------------------------------
// Servicios / viajes
// ---------------------------------------------------------------------------

export type ServiceType =
  | "hotel_hotel"
  | "aeropuerto"
  | "transporte_abierto"
  | "a_medida";

export type TripStatus =
  | "pendiente"
  | "asignado"
  | "en_camino"
  | "en_espera"
  | "pasajero_abordado"
  | "en_curso"
  | "completado"
  | "cancelado"
  | "con_incidencia";

export interface Trip {
  id: string;
  folio: string;
  serviceType: ServiceType;
  client: string;
  passengers: number;
  origin: string;
  originCoord: LatLng;
  destination: string;
  destinationCoord: LatLng;
  date: string; // ISO date (yyyy-MM-dd)
  time: string; // HH:mm
  flightNumber?: string;
  airline?: string;
  hotel?: string;
  durationHours?: number; // transporte abierto
  specialInstructions?: string;
  specialReception?: boolean;
  discount?: number; // %
  amount: number; // MXN
  driverId: string | null;
  vehicleId: string | null;
  status: TripStatus;
  plannedKm: number;
  realKm: number | null;
  // Comparación de ruta (mock)
  plannedRoute: LatLng[];
  actualRoute: LatLng[];
  estimatedMinutes: number;
  realMinutes: number | null;
  stops: number;
  detours: number;
  offRouteKm: number;
  // Cierre de viaje
  startOdometer?: number;
  endOdometer?: number;
  createdAt: string; // ISO datetime
}

// ---------------------------------------------------------------------------
// Alertas
// ---------------------------------------------------------------------------

export type AlertType =
  | "movimiento_sin_servicio"
  | "desvio_ruta"
  | "fuera_horario"
  | "exceso_velocidad"
  | "gps_desconectado"
  | "combustible_irregular"
  | "diferencia_odometro"
  | "mantenimiento_proximo"
  | "documento_por_vencer"
  | "parada_prolongada";

export type AlertPriority = "alta" | "media" | "baja";
export type AlertStatus = "pendiente" | "revisada";

export interface Alert {
  id: string;
  type: AlertType;
  priority: AlertPriority;
  status: AlertStatus;
  vehicleId: string | null;
  tripId: string | null;
  description: string;
  createdAt: string; // ISO datetime
  note?: string;
}

// ---------------------------------------------------------------------------
// Combustible
// ---------------------------------------------------------------------------

export type FuelValidation = "validado" | "pendiente" | "por_revisar";
export type PaymentMethod = "efectivo" | "tarjeta_flota" | "vale";

export interface FuelRecord {
  id: string;
  vehicleId: string;
  driverId: string;
  date: string; // ISO datetime
  liters: number;
  pricePerLiter: number;
  total: number;
  odometerKm: number;
  station: string;
  paymentMethod: PaymentMethod;
  performanceKmL: number | null; // rendimiento estimado km/L
  validation: FuelValidation;
  anomalyNote?: string; // "Anomalía por revisar", etc. Nunca "robo".
  hasTicket: boolean;
}

// ---------------------------------------------------------------------------
// Mantenimiento
// ---------------------------------------------------------------------------

export type MaintenanceType =
  | "preventivo"
  | "correctivo"
  | "servicio_mayor"
  | "llantas"
  | "frenos";

export type MaintenanceStatus =
  | "programado"
  | "en_proceso"
  | "completado"
  | "vencido";

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  type: MaintenanceType;
  currentKm: number;
  limitKm: number;
  scheduledDate: string; // ISO date
  status: MaintenanceStatus;
  estimatedCost: number;
  workshop: string;
  notes?: string;
}

// ---------------------------------------------------------------------------
// Incidencias (reportadas por el conductor)
// ---------------------------------------------------------------------------

export type IncidentType =
  | "retraso"
  | "pasajero_no_localizado"
  | "problema_vehiculo"
  | "accidente"
  | "cambio_ruta"
  | "trafico"
  | "equipaje_excedente"
  | "seguridad"
  | "otro";

export interface Incident {
  id: string;
  tripId: string | null;
  driverId: string;
  vehicleId: string | null;
  type: IncidentType;
  description: string;
  createdAt: string; // ISO datetime
  hasEvidence: boolean;
}

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
  action: ChatbotAction;
}

export interface ChatbotNode {
  id: string;
  message: string;
  options: ChatbotOption[];
}

// ---------------------------------------------------------------------------
// Formulario de reserva multi-paso (/reservar)
// ---------------------------------------------------------------------------

export type TripDirection = "sencillo" | "redondo";

export interface ReservationDraft {
  // Paso 1 — Servicio
  serviceType: ServiceType | null;
  originLocationId: string | null;
  destinationLocationId: string | null;
  direction: TripDirection;
  // Paso 2 — Detalles
  date: string; // yyyy-MM-dd
  time: string; // HH:mm
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
