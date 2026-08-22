// Catálogos, etiquetas y colores. Fuente única para evitar strings mágicos.

import type { ServiceType } from "@/types";

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

// --- Contacto (LP) -----------------------------------------------------------

// Número ficticio del DEMO. Sin formato "+" ni espacios para uso en enlaces wa.me.
export const WHATSAPP_PHONE = "529980000000";
export const WHATSAPP_DISPLAY = "+52 998 000 0000";
