import type {
  AccountingEntry,
  Alert,
  Driver,
  FuelRecord,
  MaintenanceRecord,
  Trip,
  Vehicle,
  VehicleCompliancePayment,
} from "@/types";

// Contrato de datos para migrar el DEMO a una API real sin rediseñar las vistas.
// El store mock actual puede mapearse a estos métodos y, en producción, cada
// método puede llamar endpoints REST, RPC o server actions.

export interface AdminListResult<T> {
  data: T[];
  total: number;
}

export interface AdminMutationResult<T> {
  data: T;
  source: "mock" | "api";
}

export interface AdminRepository {
  trips: {
    list: () => Promise<AdminListResult<Trip>>;
    create: (input: Omit<Trip, "id" | "createdAt">) => Promise<AdminMutationResult<Trip>>;
    update: (id: string, patch: Partial<Trip>) => Promise<AdminMutationResult<Trip>>;
  };
  vehicles: {
    list: () => Promise<AdminListResult<Vehicle>>;
    create: (input: Omit<Vehicle, "id">) => Promise<AdminMutationResult<Vehicle>>;
    update: (id: string, patch: Partial<Vehicle>) => Promise<AdminMutationResult<Vehicle>>;
    remove: (id: string) => Promise<void>;
  };
  drivers: {
    list: () => Promise<AdminListResult<Driver>>;
    create: (input: Omit<Driver, "id">) => Promise<AdminMutationResult<Driver>>;
    update: (id: string, patch: Partial<Driver>) => Promise<AdminMutationResult<Driver>>;
    remove: (id: string) => Promise<void>;
  };
  maintenance: {
    list: () => Promise<AdminListResult<MaintenanceRecord>>;
    create: (input: Omit<MaintenanceRecord, "id">) => Promise<AdminMutationResult<MaintenanceRecord>>;
    update: (id: string, patch: Partial<MaintenanceRecord>) => Promise<AdminMutationResult<MaintenanceRecord>>;
    remove: (id: string) => Promise<void>;
  };
  fuel: {
    list: () => Promise<AdminListResult<FuelRecord>>;
    create: (input: Omit<FuelRecord, "id">) => Promise<AdminMutationResult<FuelRecord>>;
    update: (id: string, patch: Partial<FuelRecord>) => Promise<AdminMutationResult<FuelRecord>>;
    remove: (id: string) => Promise<void>;
  };
  accounting: {
    list: () => Promise<AdminListResult<AccountingEntry>>;
    create: (input: Omit<AccountingEntry, "id">) => Promise<AdminMutationResult<AccountingEntry>>;
  };
  obligations: {
    list: () => Promise<AdminListResult<VehicleCompliancePayment>>;
    create: (input: Omit<VehicleCompliancePayment, "id">) => Promise<AdminMutationResult<VehicleCompliancePayment>>;
    update: (id: string, patch: Partial<VehicleCompliancePayment>) => Promise<AdminMutationResult<VehicleCompliancePayment>>;
    remove: (id: string) => Promise<void>;
  };
  alerts: {
    list: () => Promise<AdminListResult<Alert>>;
    update: (id: string, patch: Partial<Alert>) => Promise<AdminMutationResult<Alert>>;
  };
}
