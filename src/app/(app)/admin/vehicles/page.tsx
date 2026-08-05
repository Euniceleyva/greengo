"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle, CalendarClock, CheckCircle2, LayoutGrid, Plus, ShieldCheck, TableIcon } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useDemoStore, type NewVehicleInput } from "@/stores/demo-store";
import { useHydrated } from "@/lib/hooks";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column, type FilterConfig } from "@/components/shared/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input, Label, Select } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/misc";
import { EmptyState } from "@/components/shared/states";
import { VehicleStatusBadge } from "@/components/shared/badges";
import { KpiCard } from "@/components/shared/kpi-card";
import {
  VEHICLE_PAYMENT_CONCEPT_LABELS,
  VEHICLE_PAYMENT_STATUS_LABELS,
  VEHICLE_PAYMENT_STATUS_TONE,
  VEHICLE_STATUS_LABELS,
  VEHICLE_TYPE_LABELS,
} from "@/constants";
import type { Vehicle, VehicleCompliancePayment, VehicleStatus, VehicleType } from "@/types";
import { cn, formatMXN, formatNumber } from "@/lib/utils";
import { driverName } from "@/lib/lookups";
import { FuelBar } from "@/components/admin/fuel-bar";
import { toast } from "@/components/ui/toast";
import { hasDuplicateVehicleCode, hasDuplicateVehiclePlates, isFiniteNumber, normalizeCode } from "@/lib/admin-validation";
import { useSessionStore } from "@/stores/session-store";
import { MOCK_USERS } from "@/mocks/users";
import { hasAdminPermission, permissionLabel } from "@/lib/admin-permissions";

const VEHICLE_PAYMENT_TODAY = "2026-08-04";
const UPCOMING_DAYS = 30;
const VEHICLE_TYPES = Object.keys(VEHICLE_TYPE_LABELS) as VehicleType[];
const VEHICLE_STATUSES = Object.keys(VEHICLE_STATUS_LABELS) as VehicleStatus[];

export default function VehiclesPage() {
  const hydrated = useHydrated();
  const router = useRouter();
  const sessionUser = useSessionStore((s) => s.currentUser);
  const { vehicles, drivers, vehiclePayments, createVehicle } = useDemoStore();
  const [view, setView] = useState<"cards" | "table">("cards");
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (window.location.search.includes("new=1")) {
      setCreateOpen(true);
    }
  }, []);

  if (!hydrated) return <Skeleton className="h-96 w-full" />;

  const user = sessionUser ?? MOCK_USERS[0];
  const canCreate = hasAdminPermission(user.role, "admin:create");
  const pendingPayments = vehiclePayments.filter((payment) => payment.status !== "pagado");
  const overduePayments = pendingPayments.filter((payment) => payment.status === "vencido" || payment.dueDate < VEHICLE_PAYMENT_TODAY);
  const upcomingPayments = pendingPayments.filter((payment) => {
    const days = daysUntil(payment.dueDate);
    return days >= 0 && days <= UPCOMING_DAYS;
  });
  const paidThisYear = vehiclePayments.filter((payment) => payment.status === "pagado" && payment.paidDate?.startsWith("2026")).length;

  const handleCreateVehicle = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canCreate) {
      toast.warning(`Tu rol no puede ${permissionLabel("admin:create")}.`);
      return;
    }
    const formData = new FormData(event.currentTarget);
    const code = normalizeCode(readFormString(formData, "code"));
    const brand = readFormString(formData, "brand");
    const model = readFormString(formData, "model");
    const plates = normalizeCode(readFormString(formData, "plates"));
    const year = Number(formData.get("year") ?? 0);
    const capacity = Number(formData.get("capacity") ?? 0);
    const odometerKm = Number(formData.get("odometerKm") ?? 0);
    const nextMaintenanceKm = Number(formData.get("nextMaintenanceKm") ?? 0);
    const fuelLevel = Number(formData.get("fuelLevel") ?? 0);

    if (!code || !brand || !model || !plates) {
      toast.warning("Completa unidad, marca, modelo y placas.");
      return;
    }

    if (hasDuplicateVehicleCode(vehicles, code)) {
      toast.warning("Ya existe una unidad con ese código.");
      return;
    }

    if (hasDuplicateVehiclePlates(vehicles, plates)) {
      toast.warning("Ya existe un vehículo con esas placas.");
      return;
    }

    if (
      ![year, capacity, odometerKm, nextMaintenanceKm, fuelLevel].every(isFiniteNumber) ||
      year < 2000 ||
      capacity <= 0 ||
      odometerKm < 0 ||
      nextMaintenanceKm < 0 ||
      fuelLevel < 0 ||
      fuelLevel > 100
    ) {
      toast.warning("Revisa año, capacidad, kilometraje, mantenimiento y combustible.");
      return;
    }

    const vehicle: NewVehicleInput = {
      code,
      brand,
      model,
      year,
      plates,
      capacity,
      type: readFormString(formData, "type") as VehicleType,
      status: readFormString(formData, "status") as VehicleStatus,
      odometerKm,
      nextMaintenanceKm,
      fuelLevel,
      assignedDriverId: readFormString(formData, "assignedDriverId") || null,
      lastLocation: [21.1743, -86.8121],
      lastLocationName: readFormString(formData, "lastLocationName") || "Base Puerto Cancún",
      speedKmh: 0,
      documents: [
        {
          id: `doc-circ-${code.toLowerCase()}`,
          name: "Tarjeta de circulación",
          status: "vigente",
          expiresOn: readFormString(formData, "circulationExpiresOn") || "2027-12-31",
        },
        {
          id: `doc-pol-${code.toLowerCase()}`,
          name: "Póliza de seguro",
          status: "vigente",
          expiresOn: readFormString(formData, "policyExpiresOn") || "2027-12-31",
        },
      ],
    };

    const created = createVehicle(vehicle);
    setCreateOpen(false);
    setView("cards");
    toast.success(`Vehículo ${created.code} agregado al DEMO.`);
  };

  const filters: FilterConfig<Vehicle>[] = [
    {
      label: "Estado",
      options: (Object.keys(VEHICLE_STATUS_LABELS) as VehicleStatus[]).map((s) => ({
        value: s,
        label: VEHICLE_STATUS_LABELS[s],
      })),
      predicate: (v, val) => v.status === val,
    },
  ];

  const columns: Column<Vehicle>[] = [
    { key: "code", header: "Unidad", render: (v) => <span className="font-medium">{v.code}</span> },
    { key: "vehicle", header: "Vehículo", render: (v) => `${v.brand} ${v.model} ${v.year}` },
    { key: "plates", header: "Placas", render: (v) => v.plates },
    { key: "type", header: "Tipo", render: (v) => <span className="text-xs">{VEHICLE_TYPE_LABELS[v.type]}</span> },
    { key: "cap", header: "Cap.", render: (v) => `${v.capacity} pax` },
    { key: "odo", header: "Kilometraje", render: (v) => <span className="tabular-nums">{formatNumber(v.odometerKm)} km</span> },
    { key: "fuel", header: "Combustible", render: (v) => <FuelBar level={v.fuelLevel} /> },
    {
      key: "payment",
      header: "Próximo pago",
      render: (v) => <VehiclePaymentSummary payment={nextVehiclePayment(vehiclePayments, v.id)} />,
    },
    { key: "driver", header: "Conductor", render: (v) => <span className="text-xs">{driverName(drivers, v.assignedDriverId)}</span> },
    { key: "status", header: "Estado", render: (v) => <VehicleStatusBadge status={v.status} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Vehículos"
        description="Flota de unidades y su estado operativo."
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Vehículos" }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              disabled={!canCreate}
              title={!canCreate ? `Tu rol no puede ${permissionLabel("admin:create")}.` : undefined}
              onClick={() => setCreateOpen(true)}
            >
              <Plus /> Agregar vehículo
            </Button>
            <div className="flex rounded-md border border-input">
              <Button
                variant={view === "cards" ? "default" : "ghost"}
                size="sm"
                className="rounded-r-none"
                onClick={() => setView("cards")}
              >
                <LayoutGrid /> Tarjetas
              </Button>
              <Button
                variant={view === "table" ? "default" : "ghost"}
                size="sm"
                className="rounded-l-none"
                onClick={() => setView("table")}
              >
                <TableIcon /> Tabla
              </Button>
            </div>
          </div>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Pagos vencidos" value={overduePayments.length} icon={AlertTriangle} tone={overduePayments.length > 0 ? "danger" : "success"} />
        <KpiCard label="Por vencer" value={upcomingPayments.length} icon={CalendarClock} tone={upcomingPayments.length > 0 ? "warning" : "success"} hint={`${UPCOMING_DAYS} días`} />
        <KpiCard label="Pendientes" value={pendingPayments.length} icon={ShieldCheck} tone={pendingPayments.length > 0 ? "info" : "success"} />
        <KpiCard label="Pagados 2026" value={paidThisYear} icon={CheckCircle2} tone="success" />
      </div>

      {view === "table" ? (
        <DataTable
          columns={columns}
          rows={vehicles}
          getRowId={(v) => v.id}
          searchPlaceholder="Buscar por unidad, placas, marca…"
          searchAccessor={(v) => `${v.code} ${v.plates} ${v.brand} ${v.model}`}
          filters={filters}
          onRowClick={(v) => router.push(`/admin/vehicles/${v.id}`)}
          renderMobileCard={(v) => (
            <VehicleMobileCard
              vehicle={v}
              driver={driverName(drivers, v.assignedDriverId)}
              payment={nextVehiclePayment(vehiclePayments, v.id)}
            />
          )}
          emptyTitle="Sin vehículos"
          emptyDescription="Agrega una unidad para verla en operación, mantenimiento y obligaciones."
          emptyAction={
            <Button size="sm" disabled={!canCreate} onClick={() => setCreateOpen(true)}>
              <Plus /> Agregar vehículo
            </Button>
          }
        />
      ) : vehicles.length === 0 ? (
        <EmptyState
          title="Sin vehículos"
          description="Agrega una unidad para verla en operación, mantenimiento y obligaciones."
          action={
            <Button size="sm" disabled={!canCreate} onClick={() => setCreateOpen(true)}>
              <Plus /> Agregar vehículo
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {vehicles.map((v) => (
            <Card
              key={v.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => router.push(`/admin/vehicles/${v.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-lg font-bold">{v.code}</p>
                    <p className="text-sm text-muted-foreground">{v.brand} {v.model} {v.year}</p>
                  </div>
                  <VehicleStatusBadge status={v.status} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <Info label="Placas" value={v.plates} />
                  <Info label="Tipo" value={VEHICLE_TYPE_LABELS[v.type]} />
                  <Info label="Capacidad" value={`${v.capacity} pax`} />
                  <Info label="Kilometraje" value={`${formatNumber(v.odometerKm)} km`} />
                  <Info label="Conductor" value={driverName(drivers, v.assignedDriverId)} />
                  <Info label="Ubicación" value={v.lastLocationName} />
                </div>
                <div className="mt-3">
                  <p className="mb-1 text-xs text-muted-foreground">Combustible</p>
                  <FuelBar level={v.fuelLevel} />
                </div>
                <div className="mt-3 rounded-lg border border-border bg-secondary/40 p-3">
                  <p className="mb-2 text-xs font-semibold text-muted-foreground">Próxima obligación</p>
                  <VehiclePaymentSummary payment={nextVehiclePayment(vehiclePayments, v.id)} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        side
        title="Agregar vehículo"
        description="Registra una unidad mock para operación, conductor y obligaciones."
      >
        <form className="space-y-5" onSubmit={handleCreateVehicle}>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Unidad">
              <Input name="code" placeholder="U-04" required />
            </FormField>
            <FormField label="Placas">
              <Input name="plates" placeholder="QRO-0000-D" required />
            </FormField>
            <FormField label="Marca">
              <Input name="brand" placeholder="Toyota" required />
            </FormField>
            <FormField label="Modelo">
              <Input name="model" placeholder="Hiace" required />
            </FormField>
            <FormField label="Año">
              <Input name="year" type="number" min={2000} max={2030} defaultValue={2026} required />
            </FormField>
            <FormField label="Capacidad">
              <Input name="capacity" type="number" min={1} defaultValue={10} required />
            </FormField>
            <FormField label="Tipo">
              <Select name="type" defaultValue="van">
                {VEHICLE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {VEHICLE_TYPE_LABELS[type]}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Estado">
              <Select name="status" defaultValue="disponible">
                {VEHICLE_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {VEHICLE_STATUS_LABELS[status]}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Kilometraje actual">
              <Input name="odometerKm" type="number" min={0} defaultValue={0} required />
            </FormField>
            <FormField label="Próximo mantenimiento">
              <Input name="nextMaintenanceKm" type="number" min={0} defaultValue={10000} required />
            </FormField>
            <FormField label="Combustible (%)">
              <Input name="fuelLevel" type="number" min={0} max={100} defaultValue={100} required />
            </FormField>
            <FormField label="Conductor asignado">
              <Select name="assignedDriverId" defaultValue="">
                <option value="">Sin asignar</option>
                {drivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Ubicación base">
              <Input name="lastLocationName" placeholder="Base Puerto Cancún" />
            </FormField>
            <FormField label="Vence tarjeta circulación">
              <Input name="circulationExpiresOn" type="date" defaultValue="2027-12-31" />
            </FormField>
            <FormField label="Vence póliza">
              <Input name="policyExpiresOn" type="date" defaultValue="2027-12-31" />
            </FormField>
          </div>
          <div className="rounded-lg border border-border bg-secondary/50 p-3 text-sm text-muted-foreground">
            Al guardar se agrega la unidad al DEMO y queda disponible para asignación, monitoreo y registro de obligaciones.
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              <Plus /> Guardar vehículo
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

function nextVehiclePayment(payments: VehicleCompliancePayment[], vehicleId: string) {
  return payments
    .filter((payment) => payment.vehicleId === vehicleId && payment.status !== "pagado")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];
}

function daysUntil(date: string) {
  const dayMs = 86_400_000;
  const target = Date.parse(`${date}T00:00:00`);
  const today = Date.parse(`${VEHICLE_PAYMENT_TODAY}T00:00:00`);
  return Math.ceil((target - today) / dayMs);
}

function VehiclePaymentSummary({ payment }: { payment?: VehicleCompliancePayment }) {
  if (!payment) {
    return <span className="text-xs text-muted-foreground">Sin pagos pendientes.</span>;
  }
  const days = daysUntil(payment.dueDate);
  const isLate = payment.status === "vencido" || days < 0;
  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge tone={isLate ? "danger" : VEHICLE_PAYMENT_STATUS_TONE[payment.status]}>
          {isLate ? "Vencido" : VEHICLE_PAYMENT_STATUS_LABELS[payment.status]}
        </Badge>
        <span className="truncate text-xs font-semibold">{VEHICLE_PAYMENT_CONCEPT_LABELS[payment.concept]}</span>
      </div>
      <p className={cn("mt-1 text-xs", isLate ? "text-destructive" : "text-muted-foreground")}>
        {isLate ? `Venció hace ${Math.abs(days)} día(s)` : `Vence en ${days} día(s)`} · {formatMXN(payment.amount)}
      </p>
    </div>
  );
}

function VehicleMobileCard({
  vehicle,
  driver,
  payment,
}: {
  vehicle: Vehicle;
  driver: string;
  payment?: VehicleCompliancePayment;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-heading text-base font-bold">{vehicle.code}</p>
          <p className="truncate text-xs text-muted-foreground">
            {vehicle.brand} {vehicle.model} · {vehicle.plates}
          </p>
        </div>
        <VehicleStatusBadge status={vehicle.status} />
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <Info label="Conductor" value={driver} />
        <Info label="Kilometraje" value={`${formatNumber(vehicle.odometerKm)} km`} />
      </div>
      <FuelBar level={vehicle.fuelLevel} />
      <div className="rounded-md bg-secondary/50 p-2">
        <VehiclePaymentSummary payment={payment} />
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className="truncate font-medium">{value}</p>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function readFormString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}
