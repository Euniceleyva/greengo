import type { LatLng, NamedLocation } from "@/types";
import { BOOKING_ZONES } from "@/data/booking-zones";

// Coordenadas aproximadas de lugares reales de Cancún y alrededores.
// Se usan solo como referencia visual del DEMO (OpenStreetMap / Leaflet).

export const LOCATIONS: NamedLocation[] = [
  ...BOOKING_ZONES,
  { id: "loc-puerto-cancun", name: "Puerto Cancún", coord: [21.1743, -86.8121], category: "puerto" },
  { id: "loc-riu-cancun", name: "Hotel Riu Cancún", coord: [21.111, -86.7649], category: "hotel" },
  { id: "loc-moon-palace", name: "Moon Palace", coord: [20.9741, -86.809], category: "hotel" },
  { id: "loc-isla-mujeres", name: "Isla Mujeres", coord: [21.227, -86.73], category: "destino" },
  { id: "loc-cozumel", name: "Cozumel", coord: [20.4229, -86.9223], category: "destino" },
];

export function locationByName(name: string): NamedLocation | undefined {
  return LOCATIONS.find((l) => l.name === name);
}

// Rutas mock (polilíneas simplificadas) entre pares de puntos frecuentes.
// No provienen de un servicio de ruteo real; son trazos aproximados para el DEMO.
export const MOCK_ROUTES: Record<string, LatLng[]> = {
  "aeropuerto-zona-hotelera": [
    [21.0417, -86.874],
    [21.058, -86.845],
    [21.085, -86.79],
    [21.11, -86.762],
    [21.1329, -86.7466],
  ],
  "aeropuerto-riu": [
    [21.0417, -86.874],
    [21.06, -86.84],
    [21.09, -86.79],
    [21.111, -86.7649],
  ],
  "aeropuerto-moon-palace": [
    [21.0417, -86.874],
    [21.02, -86.85],
    [20.995, -86.83],
    [20.9741, -86.809],
  ],
  "aeropuerto-playa-carmen": [
    [21.0417, -86.874],
    [20.95, -86.9],
    [20.8, -86.98],
    [20.7, -87.03],
    [20.6296, -87.0739],
  ],
  "zona-hotelera-puerto-cancun": [
    [21.1329, -86.7466],
    [21.15, -86.78],
    [21.1743, -86.8121],
  ],
  "aeropuerto-tulum": [
    [21.0417, -86.874],
    [20.85, -86.95],
    [20.6, -87.1],
    [20.4, -87.3],
    [20.2114, -87.4654],
  ],
};
