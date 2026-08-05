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
  AdminActivityEvent,
  AccountingAuditEvent,
  AccountingCommission,
  AccountingEntry,
  AccountingFixedExpense,
  AccountingPayable,
  AccountingPeriodClose,
  AccountingReceivable,
  Driver,
  DriverDocumentFile,
  DriverDocumentKind,
  FuelRecord,
  Incident,
  LatLng,
  MaintenanceRecord,
  Trip,
  TripStatus,
  Vehicle,
  VehicleCompliancePayment,
} from "@/types";
import { MOCK_VEHICLES } from "@/mocks/vehicles";
import { MOCK_DRIVERS } from "@/mocks/drivers";
import { MOCK_TRIPS } from "@/mocks/trips";
import { MOCK_ALERTS } from "@/mocks/alerts";
import { MOCK_FUEL } from "@/mocks/fuel";
import { MOCK_MAINTENANCE } from "@/mocks/maintenance";
import { MOCK_INCIDENTS } from "@/mocks/incidents";
import { MOCK_VEHICLE_PAYMENTS } from "@/mocks/vehicle-payments";
import {
  MOCK_ACCOUNTING_ENTRIES,
  MOCK_COMMISSIONS,
  MOCK_FIXED_EXPENSES,
  MOCK_PAYABLES,
  MOCK_RECEIVABLES,
} from "@/mocks/accounting";
import { shortId } from "@/lib/utils";

export interface NewTripInput {
  serviceType: Trip["serviceType"];
  direction?: Trip["direction"];
  bookingSource?: Trip["bookingSource"];
  client: string;
  contactPhone?: string;
  contactEmail?: string;
  passengers: number;
  bags?: number;
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
  paymentStatus?: Trip["paymentStatus"];
  autoAssign?: boolean;
}

export type NewAccountingEntryInput = Omit<AccountingEntry, "id">;
export type NewAccountingReceivableInput = Omit<AccountingReceivable, "id">;
export type NewAccountingPayableInput = Omit<AccountingPayable, "id">;
export type NewAccountingFixedExpenseInput = Omit<AccountingFixedExpense, "id">;
export type NewAccountingCommissionInput = Omit<AccountingCommission, "id">;
export type NewAccountingPeriodCloseInput = Omit<AccountingPeriodClose, "id" | "closedAt">;
export type NewAccountingAuditEventInput = Omit<AccountingAuditEvent, "id" | "date">;
export type NewVehiclePaymentInput = Omit<VehicleCompliancePayment, "id">;
export type NewVehicleInput = Omit<Vehicle, "id">;
export type NewDriverInput = Omit<Driver, "id">;
export type NewMaintenanceInput = Omit<MaintenanceRecord, "id">;
export type NewAdminActivityInput = Omit<AdminActivityEvent, "id" | "createdAt">;
export type NewDriverDocumentInput = Omit<DriverDocumentFile, "id" | "uploadedAt">;

function estimateTripKm(origin: LatLng, destination: LatLng) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthKm = 6371;
  const deltaLat = toRad(destination[0] - origin[0]);
  const deltaLon = toRad(destination[1] - origin[1]);
  const lat1 = toRad(origin[0]);
  const lat2 = toRad(destination[0]);
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;
  const straightKm = earthKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number(Math.max(straightKm * 1.28, 4).toFixed(1));
}

function estimateTripMinutes(plannedKm: number) {
  return Math.max(15, Math.round((plannedKm / 48) * 60));
}

function buildMockRoute(origin: LatLng, destination: LatLng): LatLng[] {
  const midLat = (origin[0] + destination[0]) / 2;
  const midLon = (origin[1] + destination[1]) / 2;
  return [
    origin,
    [midLat + 0.012, midLon - 0.018],
    destination,
  ];
}

function pickMockAssignment(drivers: Driver[], vehicles: Vehicle[]) {
  const driver = drivers.find((item) => item.status === "activo" || item.status === "descanso") ?? drivers[0];
  const vehicle =
    vehicles.find((item) => item.status === "disponible" && (!driver || item.assignedDriverId === driver.id)) ??
    vehicles.find((item) => item.status === "disponible") ??
    vehicles[0];
  return {
    driverId: driver?.id ?? null,
    vehicleId: vehicle?.id ?? driver?.assignedVehicleId ?? null,
  };
}

interface DemoState {
  vehicles: Vehicle[];
  drivers: Driver[];
  driverDocuments: DriverDocumentFile[];
  trips: Trip[];
  alerts: Alert[];
  fuel: FuelRecord[];
  maintenance: MaintenanceRecord[];
  vehiclePayments: VehicleCompliancePayment[];
  incidents: Incident[];
  accounting: AccountingEntry[];
  receivables: AccountingReceivable[];
  payables: AccountingPayable[];
  fixedExpenses: AccountingFixedExpense[];
  commissions: AccountingCommission[];
  periodClosures: AccountingPeriodClose[];
  accountingAuditLog: AccountingAuditEvent[];
  adminActivityLog: AdminActivityEvent[];

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
  updateFuelRecord: (id: string, patch: Partial<FuelRecord>) => void;
  deleteFuelRecord: (id: string) => void;

  // Mantenimiento
  createMaintenance: (record: NewMaintenanceInput) => MaintenanceRecord;
  updateMaintenance: (id: string, patch: Partial<MaintenanceRecord>) => void;
  deleteMaintenance: (id: string) => void;

  // Obligaciones vehiculares
  addVehiclePayment: (payment: NewVehiclePaymentInput) => VehicleCompliancePayment;
  updateVehiclePayment: (id: string, patch: Partial<VehicleCompliancePayment>) => void;
  deleteVehiclePayment: (id: string) => void;

  // Incidencias
  addIncident: (incident: Omit<Incident, "id" | "createdAt">) => void;

  // Contabilidad
  addAccountingEntry: (entry: NewAccountingEntryInput) => AccountingEntry;
  addReceivable: (receivable: NewAccountingReceivableInput) => AccountingReceivable;
  addPayable: (payable: NewAccountingPayableInput) => AccountingPayable;
  addFixedExpense: (expense: NewAccountingFixedExpenseInput) => AccountingFixedExpense;
  addCommission: (commission: NewAccountingCommissionInput) => AccountingCommission;
  closeAccountingPeriod: (periodClose: NewAccountingPeriodCloseInput) => AccountingPeriodClose;
  reopenAccountingPeriod: (periodId: string) => void;
  addAccountingAuditEvent: (event: NewAccountingAuditEventInput) => AccountingAuditEvent;

  // Vehículos (monitoreo / simulación de movimiento)
  createVehicle: (vehicle: NewVehicleInput) => Vehicle;
  updateVehicle: (id: string, patch: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;

  // Conductores
  createDriver: (driver: NewDriverInput) => Driver;
  updateDriver: (id: string, patch: Partial<Driver>) => void;
  deleteDriver: (id: string) => void;
  upsertDriverDocument: (document: NewDriverDocumentInput) => DriverDocumentFile;
  deleteDriverDocument: (driverId: string, kind: DriverDocumentKind) => void;

  // Reset del DEMO
  resetDemo: () => void;
}

function activity(event: NewAdminActivityInput): AdminActivityEvent {
  return {
    ...event,
    id: shortId("act"),
    createdAt: new Date().toISOString(),
  };
}

function seed() {
  // Copias profundas para no mutar los mocks originales.
  return {
    vehicles: structuredClone(MOCK_VEHICLES),
    drivers: structuredClone(MOCK_DRIVERS),
    driverDocuments: [],
    trips: structuredClone(MOCK_TRIPS),
    alerts: structuredClone(MOCK_ALERTS),
    fuel: structuredClone(MOCK_FUEL),
    maintenance: structuredClone(MOCK_MAINTENANCE),
    vehiclePayments: structuredClone(MOCK_VEHICLE_PAYMENTS),
    incidents: structuredClone(MOCK_INCIDENTS),
    accounting: structuredClone(MOCK_ACCOUNTING_ENTRIES),
    receivables: structuredClone(MOCK_RECEIVABLES),
    payables: structuredClone(MOCK_PAYABLES),
    fixedExpenses: structuredClone(MOCK_FIXED_EXPENSES),
    commissions: structuredClone(MOCK_COMMISSIONS),
    periodClosures: [],
    accountingAuditLog: [],
    adminActivityLog: [
      {
        id: "act-seed-01",
        type: "servicio" as const,
        title: "Servicios importados al DEMO",
        detail: "La operación inicial quedó disponible para revisión.",
        href: "/admin/trips",
        createdAt: "2026-08-04T09:00:00",
      },
      {
        id: "act-seed-02",
        type: "vehiculo" as const,
        title: "Flota inicial cargada",
        detail: "Unidades, documentos y obligaciones listas para seguimiento.",
        href: "/admin/vehicles",
        createdAt: "2026-08-04T08:45:00",
      },
      {
        id: "act-seed-03",
        type: "contabilidad" as const,
        title: "Contabilidad mock preparada",
        detail: "Ingresos, egresos y cuentas administrativas disponibles.",
        href: "/admin/accounting",
        createdAt: "2026-08-04T08:30:00",
      },
    ],
  };
}

export const useDemoStore = create<DemoState>()(
  persist(
    (set, get) => ({
      ...seed(),

      createTrip: (input) => {
        const trips = get().trips;
        const state = get();
        const sequence = String(trips.length + 1).padStart(3, "0");
        const originCoord = input.originCoord ?? [21.0417, -86.874];
        const destinationCoord = input.destinationCoord ?? [21.1329, -86.7466];
        const plannedKm = estimateTripKm(originCoord, destinationCoord);
        const autoAssignment = input.autoAssign
          ? pickMockAssignment(state.drivers, state.vehicles)
          : { driverId: input.driverId, vehicleId: input.vehicleId };
        const trip: Trip = {
          id: shortId("trip"),
          folio: `${input.folioPrefix ?? "GG-2607"}-${sequence}`,
          serviceType: input.serviceType,
          direction: input.direction ?? "sencillo",
          bookingSource: input.bookingSource ?? "admin",
          client: input.client,
          contactPhone: input.contactPhone,
          contactEmail: input.contactEmail,
          passengers: input.passengers,
          bags: input.bags,
          origin: input.origin,
          originCoord,
          destination: input.destination,
          destinationCoord,
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
          paymentStatus: input.paymentStatus ?? (input.amount > 0 ? "pendiente" : "cotizacion"),
          driverId: autoAssignment.driverId,
          vehicleId: autoAssignment.vehicleId,
          status: autoAssignment.driverId ? "asignado" : "pendiente",
          plannedKm,
          realKm: null,
          plannedRoute: buildMockRoute(originCoord, destinationCoord),
          actualRoute: [],
          estimatedMinutes: estimateTripMinutes(plannedKm),
          realMinutes: null,
          stops: 0,
          detours: 0,
          offRouteKm: 0,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({
          trips: [trip, ...s.trips],
          adminActivityLog: [
            activity({
              type: "servicio",
              title: `Servicio ${trip.folio} creado`,
              detail: `${trip.client} · ${trip.origin} a ${trip.destination}`,
              href: `/admin/trips/${trip.id}`,
            }),
            ...(s.adminActivityLog ?? []),
          ].slice(0, 30),
        }));
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
          drivers: s.drivers.map((driver) => {
            const trip = s.trips.find((t) => t.id === id);
            if (!trip || trip.driverId !== driver.id || status !== "completado" || trip.status === "completado") {
              return driver;
            }
            const km = trip.realKm ?? trip.plannedKm;
            return {
              ...driver,
              completedTrips: driver.completedTrips + 1,
              drivenKm: Math.round(driver.drivenKm + km),
            };
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
          adminActivityLog: [
            activity({
              type: "combustible",
              title: "Carga de combustible registrada",
              detail: `${record.liters} L · ${record.station}`,
              href: "/admin/fuel",
            }),
            ...(s.adminActivityLog ?? []),
          ].slice(0, 30),
        })),

      updateFuelRecord: (id, patch) =>
        set((s) => ({
          fuel: s.fuel.map((record) => (record.id === id ? { ...record, ...patch } : record)),
        })),

      deleteFuelRecord: (id) =>
        set((s) => ({
          fuel: s.fuel.filter((record) => record.id !== id),
        })),

      createMaintenance: (record) => {
        const next: MaintenanceRecord = { ...record, id: shortId("mnt") };
        set((s) => ({
          maintenance: [next, ...s.maintenance],
          adminActivityLog: [
            activity({
              type: "mantenimiento",
              title: "Mantenimiento registrado",
              detail: `${next.workshop} · ${next.scheduledDate}`,
              href: "/admin/maintenance",
            }),
            ...(s.adminActivityLog ?? []),
          ].slice(0, 30),
        }));
        return next;
      },

      updateMaintenance: (id, patch) =>
        set((s) => ({
          maintenance: s.maintenance.map((record) => (record.id === id ? { ...record, ...patch } : record)),
        })),

      deleteMaintenance: (id) =>
        set((s) => ({
          maintenance: s.maintenance.filter((record) => record.id !== id),
        })),

      addVehiclePayment: (payment) => {
        const next: VehicleCompliancePayment = { ...payment, id: shortId("vehpay") };
        set((s) => ({
          vehiclePayments: [next, ...s.vehiclePayments],
          adminActivityLog: [
            activity({
              type: "obligacion",
              title: "Obligación vehicular registrada",
              detail: `${next.description} · ${next.dueDate}`,
              href: `/admin/vehicles/${next.vehicleId}`,
            }),
            ...(s.adminActivityLog ?? []),
          ].slice(0, 30),
        }));
        return next;
      },

      updateVehiclePayment: (id, patch) =>
        set((s) => ({
          vehiclePayments: s.vehiclePayments.map((payment) => (payment.id === id ? { ...payment, ...patch } : payment)),
        })),

      deleteVehiclePayment: (id) =>
        set((s) => ({
          vehiclePayments: s.vehiclePayments.filter((payment) => payment.id !== id),
        })),

      addIncident: (incident) =>
        set((s) => ({
          incidents: [
            { ...incident, id: shortId("inc"), createdAt: new Date().toISOString() },
            ...s.incidents,
          ],
        })),

      addAccountingEntry: (entry) => {
        const next: AccountingEntry = { ...entry, id: shortId("acc") };
        set((s) => ({
          accounting: [next, ...s.accounting],
          adminActivityLog: [
            activity({
              type: "contabilidad",
              title: "Movimiento contable registrado",
              detail: `${next.concept} · ${next.type}`,
              href: "/admin/accounting",
            }),
            ...(s.adminActivityLog ?? []),
          ].slice(0, 30),
        }));
        return next;
      },

      addReceivable: (receivable) => {
        const next: AccountingReceivable = { ...receivable, id: shortId("ar") };
        set((s) => ({
          receivables: [next, ...s.receivables],
          adminActivityLog: [
            activity({
              type: "contabilidad",
              title: "Cuenta por cobrar agregada",
              detail: `${next.client} · ${next.concept}`,
              href: "/admin/accounting",
            }),
            ...(s.adminActivityLog ?? []),
          ].slice(0, 30),
        }));
        return next;
      },

      addPayable: (payable) => {
        const next: AccountingPayable = { ...payable, id: shortId("ap") };
        set((s) => ({
          payables: [next, ...s.payables],
          adminActivityLog: [
            activity({
              type: "contabilidad",
              title: "Cuenta por pagar agregada",
              detail: `${next.provider} · ${next.concept}`,
              href: "/admin/accounting",
            }),
            ...(s.adminActivityLog ?? []),
          ].slice(0, 30),
        }));
        return next;
      },

      addFixedExpense: (expense) => {
        const next: AccountingFixedExpense = { ...expense, id: shortId("fix") };
        set((s) => ({
          fixedExpenses: [next, ...s.fixedExpenses],
          adminActivityLog: [
            activity({
              type: "contabilidad",
              title: "Gasto fijo agregado",
              detail: `${next.concept} · ${next.frequency}`,
              href: "/admin/accounting",
            }),
            ...(s.adminActivityLog ?? []),
          ].slice(0, 30),
        }));
        return next;
      },

      addCommission: (commission) => {
        const next: AccountingCommission = { ...commission, id: shortId("com") };
        set((s) => ({
          commissions: [next, ...s.commissions],
          adminActivityLog: [
            activity({
              type: "contabilidad",
              title: "Comisión agregada",
              detail: `${next.name} · ${next.source}`,
              href: "/admin/accounting",
            }),
            ...(s.adminActivityLog ?? []),
          ].slice(0, 30),
        }));
        return next;
      },

      closeAccountingPeriod: (periodClose) => {
        const next: AccountingPeriodClose = {
          ...periodClose,
          id: shortId("close"),
          closedAt: new Date().toISOString(),
        };
        set((s) => ({
          periodClosures: [next, ...s.periodClosures.filter((item) => item.periodId !== next.periodId)],
        }));
        return next;
      },

      reopenAccountingPeriod: (periodId) =>
        set((s) => ({
          periodClosures: s.periodClosures.filter((item) => item.periodId !== periodId),
        })),

      addAccountingAuditEvent: (event) => {
        const next: AccountingAuditEvent = {
          ...event,
          id: shortId("audit"),
          date: new Date().toISOString(),
        };
        set((s) => ({ accountingAuditLog: [next, ...s.accountingAuditLog].slice(0, 40) }));
        return next;
      },

      createVehicle: (vehicle) => {
        const next: Vehicle = { ...vehicle, id: shortId("veh") };
        set((s) => ({
          vehicles: [next, ...s.vehicles],
          adminActivityLog: [
            activity({
              type: "vehiculo",
              title: `Vehículo ${next.code} agregado`,
              detail: `${next.brand} ${next.model} · ${next.plates}`,
              href: `/admin/vehicles/${next.id}`,
            }),
            ...(s.adminActivityLog ?? []),
          ].slice(0, 30),
        }));
        return next;
      },

      updateVehicle: (id, patch) =>
        set((s) => ({
          vehicles: s.vehicles.map((v) => (v.id === id ? { ...v, ...patch } : v)),
        })),

      deleteVehicle: (id) =>
        set((s) => ({
          vehicles: s.vehicles.filter((vehicle) => vehicle.id !== id),
          trips: s.trips.map((trip) => (trip.vehicleId === id ? { ...trip, vehicleId: null } : trip)),
          drivers: s.drivers.map((driver) => (driver.assignedVehicleId === id ? { ...driver, assignedVehicleId: null } : driver)),
          fuel: s.fuel.filter((record) => record.vehicleId !== id),
          maintenance: s.maintenance.filter((record) => record.vehicleId !== id),
          vehiclePayments: s.vehiclePayments.filter((payment) => payment.vehicleId !== id),
        })),

      createDriver: (driver) => {
        const next: Driver = { ...driver, id: shortId("drv") };
        set((s) => ({
          drivers: [next, ...s.drivers],
          adminActivityLog: [
            activity({
              type: "conductor",
              title: `Conductor ${next.name} agregado`,
              detail: `${next.licenseNumber} · ${next.phone}`,
              href: `/admin/drivers/${next.id}`,
            }),
            ...(s.adminActivityLog ?? []),
          ].slice(0, 30),
        }));
        return next;
      },

      updateDriver: (id, patch) =>
        set((s) => ({
          drivers: s.drivers.map((driver) => (driver.id === id ? { ...driver, ...patch } : driver)),
        })),

      deleteDriver: (id) =>
        set((s) => ({
          drivers: s.drivers.filter((driver) => driver.id !== id),
          driverDocuments: (s.driverDocuments ?? []).filter((document) => document.driverId !== id),
          trips: s.trips.map((trip) => (trip.driverId === id ? { ...trip, driverId: null } : trip)),
          vehicles: s.vehicles.map((vehicle) => (vehicle.assignedDriverId === id ? { ...vehicle, assignedDriverId: null } : vehicle)),
          fuel: s.fuel.filter((record) => record.driverId !== id),
        })),

      upsertDriverDocument: (document) => {
        const next: DriverDocumentFile = {
          ...document,
          id: shortId("drvdoc"),
          uploadedAt: new Date().toISOString(),
        };
        set((s) => ({
          driverDocuments: [
            next,
            ...(s.driverDocuments ?? []).filter(
              (item) => !(item.driverId === document.driverId && item.kind === document.kind),
            ),
          ],
          adminActivityLog: [
            activity({
              type: "conductor",
              title: "Documento de conductor actualizado",
              detail: `${document.fileName} · ${document.kind === "licencia_digital" ? "Licencia digital" : "Tarjeta de circulación"}`,
              href: `/admin/drivers/${document.driverId}`,
            }),
            ...(s.adminActivityLog ?? []),
          ].slice(0, 30),
        }));
        return next;
      },

      deleteDriverDocument: (driverId, kind) =>
        set((s) => ({
          driverDocuments: (s.driverDocuments ?? []).filter(
            (document) => !(document.driverId === driverId && document.kind === kind),
          ),
        })),

      resetDemo: () => set({ ...seed() }),
    }),
    {
      name: "greengo-demo-store",
      version: 1,
    },
  ),
);
