import type { Incident } from "@/types";

// Incidencias reportadas por conductores (mock).
export const MOCK_INCIDENTS: Incident[] = [
  {
    id: "inc-01",
    tripId: "trip-09",
    driverId: "drv-07",
    vehicleId: "veh-08",
    type: "trafico",
    description: "Tráfico intenso en Blvd. Kukulcán, retraso de 20 minutos.",
    createdAt: "2026-07-11T17:40:00",
    hasEvidence: false,
  },
  {
    id: "inc-02",
    tripId: "trip-16",
    driverId: "drv-04",
    vehicleId: "veh-04",
    type: "pasajero_no_localizado",
    description: "El pasajero no se presentó en el punto de encuentro. Servicio cancelado.",
    createdAt: "2026-07-11T11:50:00",
    hasEvidence: true,
  },
];
