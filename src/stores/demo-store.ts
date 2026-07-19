"use client";

// Store único del DEMO. Es la "base de datos" simulada: arranca desde los mocks
// y persiste en localStorage. Admin y conductor comparten este estado, por lo que
// los cambios del conductor se reflejan en el panel administrativo.
// TODO(prod): reemplazar por llamadas a la API / backend real.

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Alert,
  AlertPriority,
  Driver,
  FuelRecord,
  Incident,
  LatLng,
  MaintenanceRecord,
  Trip,
  TripStatus,
  Vehicle,
} from "@/types";
import { MOCK_VEHICLES } from "@/mocks/vehicles";
import { MOCK_DRIVERS } from "@/mocks/drivers";
import { MOCK_TRIPS } from "@/mocks/trips";
import { MOCK_ALERTS } from "@/mocks/alerts";
import { MOCK_FUEL } from "@/mocks/fuel";
import { MOCK_MAINTENANCE } from "@/mocks/maintenance";
import { MOCK_INCIDENTS } from "@/mocks/incidents";
import { shortId } from "@/lib/utils";

export interface NewTripInput {
  serviceType: Trip["serviceType"];
  client: string;
  passengers: number;
  origin: string;
  destination: string;
  date: string;
  time: string;
  amount: number;
  driverId: string | null;
  vehicleId: string | null;
  flightNumber?: string;
  airline?: string;
  hotel?: string;
  durationHours?: number;
  specialInstructions?: string;
  specialReception?: boolean;
  discount?: number;
  originCoord?: LatLng;
  destinationCoord?: LatLng;
  folioPrefix?: string;
}

interface DemoState {
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  alerts: Alert[];
  fuel: FuelRecord[];
  maintenance: MaintenanceRecord[];
  incidents: Incident[];

  // Viajes
  createTrip: (input: NewTripInput) => Trip;
  updateTrip: (id: string, patch: Partial<Trip>) => void;
  setTripStatus: (id: string, status: TripStatus) => void;
  assignTrip: (id: string, driverId: string | null, vehicleId: string | null) => void;

  // Alertas
  markAlertReviewed: (id: string) => void;
  setAlertPriority: (id: string, priority: AlertPriority) => void;
  addAlertNote: (id: string, note: string) => void;

  // Combustible
  addFuelRecord: (record: Omit<FuelRecord, "id">) => void;

  // Incidencias
  addIncident: (incident: Omit<Incident, "id" | "createdAt">) => void;

  // Vehículos (monitoreo / simulación de movimiento)
  updateVehicle: (id: string, patch: Partial<Vehicle>) => void;

  // Reset del DEMO
  resetDemo: () => void;
}

function seed() {
  // Copias profundas para no mutar los mocks originales.
  return {
    vehicles: structuredClone(MOCK_VEHICLES),
    drivers: structuredClone(MOCK_DRIVERS),
    trips: structuredClone(MOCK_TRIPS),
    alerts: structuredClone(MOCK_ALERTS),
    fuel: structuredClone(MOCK_FUEL),
    maintenance: structuredClone(MOCK_MAINTENANCE),
    incidents: structuredClone(MOCK_INCIDENTS),
  };
}

export const useDemoStore = create<DemoState>()(
  persist(
    (set, get) => ({
      ...seed(),

      createTrip: (input) => {
        const trips = get().trips;
        const sequence = String(trips.length + 1).padStart(3, "0");
        const trip: Trip = {
          id: shortId("trip"),
          folio: `${input.folioPrefix ?? "GG-2607"}-${sequence}`,
          serviceType: input.serviceType,
          client: input.client,
          passengers: input.passengers,
          origin: input.origin,
          originCoord: input.originCoord ?? [21.0417, -86.874],
          destination: input.destination,
          destinationCoord: input.destinationCoord ?? [21.1329, -86.7466],
          date: input.date,
          time: input.time,
          flightNumber: input.flightNumber,
          airline: input.airline,
          hotel: input.hotel,
          durationHours: input.durationHours,
          specialInstructions: input.specialInstructions,
          specialReception: input.specialReception,
          discount: input.discount,
          amount: input.amount,
          driverId: input.driverId,
          vehicleId: input.vehicleId,
          status: input.driverId ? "asignado" : "pendiente",
          plannedKm: 20,
          realKm: null,
          plannedRoute: [
            [21.0417, -86.874],
            [21.09, -86.79],
            [21.1329, -86.7466],
          ],
          actualRoute: [],
          estimatedMinutes: 30,
          realMinutes: null,
          stops: 0,
          detours: 0,
          offRouteKm: 0,
          createdAt: new Date().toISOString(),
        };
        set({ trips: [trip, ...trips] });
        return trip;
      },

      updateTrip: (id, patch) =>
        set((s) => ({
          trips: s.trips.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),

      setTripStatus: (id, status) =>
        set((s) => ({
          trips: s.trips.map((t) => {
            if (t.id !== id) return t;
            const patch: Partial<Trip> = { status };
            if (status === "completado" && t.realKm === null) {
              patch.realKm = Number((t.plannedKm * 1.05).toFixed(1));
              patch.realMinutes = Math.round(t.estimatedMinutes * 1.1);
            }
            return { ...t, ...patch };
          }),
        })),

      assignTrip: (id, driverId, vehicleId) =>
        set((s) => ({
          trips: s.trips.map((t) =>
            t.id === id
              ? {
                  ...t,
                  driverId,
                  vehicleId,
                  status: driverId && t.status === "pendiente" ? "asignado" : t.status,
                }
              : t,
          ),
        })),

      markAlertReviewed: (id) =>
        set((s) => ({
          alerts: s.alerts.map((a) =>
            a.id === id ? { ...a, status: "revisada" } : a,
          ),
        })),

      setAlertPriority: (id, priority) =>
        set((s) => ({
          alerts: s.alerts.map((a) => (a.id === id ? { ...a, priority } : a)),
        })),

      addAlertNote: (id, note) =>
        set((s) => ({
          alerts: s.alerts.map((a) => (a.id === id ? { ...a, note } : a)),
        })),

      addFuelRecord: (record) =>
        set((s) => ({
          fuel: [{ ...record, id: shortId("fuel") }, ...s.fuel],
        })),

      addIncident: (incident) =>
        set((s) => ({
          incidents: [
            { ...incident, id: shortId("inc"), createdAt: new Date().toISOString() },
            ...s.incidents,
          ],
        })),

      updateVehicle: (id, patch) =>
        set((s) => ({
          vehicles: s.vehicles.map((v) => (v.id === id ? { ...v, ...patch } : v)),
        })),

      resetDemo: () => set({ ...seed() }),
    }),
    {
      name: "greengo-demo-store",
      version: 1,
    },
  ),
);
