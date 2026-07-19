// Catálogos, etiquetas y colores. Fuente única para evitar strings mágicos.

import type {
  AlertPriority,
  AlertStatus,
  AlertType,
  DriverStatus,
  FuelValidation,
  IncidentType,
  MaintenanceStatus,
  MaintenanceType,
  ServiceType,
  TripStatus,
  VehicleStatus,
  VehicleType,
} from "@/types";

export type BadgeTone =
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "purple";

// --- Servicios / viajes ----------------------------------------------------

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  hotel_hotel: "Hotel a hotel",
  aeropuerto: "Aeropuerto / hotel",
  transporte_abierto: "Transporte abierto",
  a_medida: "Solución a medida",
};

export const TRIP_STATUS_LABELS: Record<TripStatus, string> = {
  pendiente: "Pendiente",
  asignado: "Asignado",
  en_camino: "Conductor en camino",
  en_espera: "En espera",
  pasajero_abordado: "Pasajero abordado",
  en_curso: "En curso",
  completado: "Completado",
  cancelado: "Cancelado",
  con_incidencia: "Con incidencia",
};

export const TRIP_STATUS_TONE: Record<TripStatus, BadgeTone> = {
  pendiente: "neutral",
  asignado: "info",
  en_camino: "info",
  en_espera: "warning",
  pasajero_abordado: "purple",
  en_curso: "info",
  completado: "success",
  cancelado: "neutral",
  con_incidencia: "danger",
};

// Flujo de estados que puede accionar el conductor sobre un servicio.
export const DRIVER_STATUS_FLOW: TripStatus[] = [
  "asignado",
  "en_camino",
  "en_espera",
  "pasajero_abordado",
  "en_curso",
  "completado",
];

export const DRIVER_ACTION_LABELS: Partial<Record<TripStatus, string>> = {
  asignado: "Aceptar servicio",
  en_camino: "Voy en camino",
  en_espera: "Llegué al punto de encuentro",
  pasajero_abordado: "Pasajero abordado",
  en_curso: "Iniciar viaje",
  completado: "Finalizar viaje",
};

// --- Vehículos -------------------------------------------------------------

export const VEHICLE_STATUS_LABELS: Record<VehicleStatus, string> = {
  disponible: "Disponible",
  en_ruta: "En ruta",
  detenido: "Detenido",
  mantenimiento: "En mantenimiento",
  con_alerta: "Con alerta",
};

export const VEHICLE_STATUS_TONE: Record<VehicleStatus, BadgeTone> = {
  disponible: "success",
  en_ruta: "info",
  detenido: "warning",
  mantenimiento: "neutral",
  con_alerta: "danger",
};

export const VEHICLE_STATUS_COLOR: Record<VehicleStatus, string> = {
  disponible: "#16a34a",
  en_ruta: "#2563eb",
  detenido: "#d97706",
  mantenimiento: "#6b7280",
  con_alerta: "#dc2626",
};

export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  van: "Van",
  suburban: "Suburban",
  sedan: "Sedán",
  sprinter: "Sprinter",
  autobus: "Autobús",
};

// --- Conductores -----------------------------------------------------------

export const DRIVER_STATUS_LABELS: Record<DriverStatus, string> = {
  activo: "Activo",
  en_servicio: "En servicio",
  descanso: "En descanso",
  inactivo: "Inactivo",
};

export const DRIVER_STATUS_TONE: Record<DriverStatus, BadgeTone> = {
  activo: "success",
  en_servicio: "info",
  descanso: "warning",
  inactivo: "neutral",
};

// --- Alertas ---------------------------------------------------------------

export const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  movimiento_sin_servicio: "Vehículo en movimiento sin servicio activo",
  desvio_ruta: "Desvío de ruta",
  fuera_horario: "Uso fuera del horario permitido",
  exceso_velocidad: "Exceso de velocidad",
  gps_desconectado: "GPS desconectado",
  combustible_irregular: "Nivel de combustible irregular",
  diferencia_odometro: "Diferencia entre odómetro y GPS",
  mantenimiento_proximo: "Mantenimiento próximo",
  documento_por_vencer: "Documento por vencer",
  parada_prolongada: "Parada prolongada",
};

export const ALERT_PRIORITY_LABELS: Record<AlertPriority, string> = {
  alta: "Alta",
  media: "Media",
  baja: "Baja",
};

export const ALERT_PRIORITY_TONE: Record<AlertPriority, BadgeTone> = {
  alta: "danger",
  media: "warning",
  baja: "neutral",
};

export const ALERT_STATUS_LABELS: Record<AlertStatus, string> = {
  pendiente: "Pendiente",
  revisada: "Revisada",
};

// --- Combustible -----------------------------------------------------------

export const FUEL_VALIDATION_LABELS: Record<FuelValidation, string> = {
  validado: "Validado",
  pendiente: "Pendiente",
  por_revisar: "Por revisar",
};

export const FUEL_VALIDATION_TONE: Record<FuelValidation, BadgeTone> = {
  validado: "success",
  pendiente: "warning",
  por_revisar: "danger",
};

// --- Mantenimiento ---------------------------------------------------------

export const MAINTENANCE_TYPE_LABELS: Record<MaintenanceType, string> = {
  preventivo: "Preventivo",
  correctivo: "Correctivo",
  servicio_mayor: "Servicio mayor",
  llantas: "Llantas",
  frenos: "Frenos",
};

export const MAINTENANCE_STATUS_LABELS: Record<MaintenanceStatus, string> = {
  programado: "Programado",
  en_proceso: "En proceso",
  completado: "Completado",
  vencido: "Vencido",
};

export const MAINTENANCE_STATUS_TONE: Record<MaintenanceStatus, BadgeTone> = {
  programado: "info",
  en_proceso: "warning",
  completado: "success",
  vencido: "danger",
};

// --- Incidencias -----------------------------------------------------------

export const INCIDENT_TYPE_LABELS: Record<IncidentType, string> = {
  retraso: "Retraso",
  pasajero_no_localizado: "Pasajero no localizado",
  problema_vehiculo: "Problema con vehículo",
  accidente: "Accidente",
  cambio_ruta: "Cambio de ruta",
  trafico: "Tráfico",
  equipaje_excedente: "Equipaje excedente",
  seguridad: "Problema de seguridad",
  otro: "Otro",
};

export const CANCUN_CENTER: [number, number] = [21.0619, -86.8515];

// --- Contacto (LP) -----------------------------------------------------------

// Número ficticio del DEMO. Sin formato "+" ni espacios para uso en enlaces wa.me.
export const WHATSAPP_PHONE = "529980000000";
export const WHATSAPP_DISPLAY = "+52 998 000 0000";
