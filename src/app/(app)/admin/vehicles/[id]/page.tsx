"use client";

import { useState, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarClock, Car, CreditCard, Edit, FileText, Gauge, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useDemoStore, type NewVehiclePaymentInput } from "@/stores/demo-store";
import { useHydrated } from "@/lib/hooks";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/misc";
import { EmptyState } from "@/components/shared/states";
import {
  VehicleStatusBadge,
  TripStatusBadge,
  MaintenanceStatusBadge,
  AlertPriorityBadge,
} from "@/components/shared/badges";
import { FuelBar } from "@/components/admin/fuel-bar";
import { SimpleLineChart } from "@/components/charts/charts";
import {
  ALERT_TYPE_LABELS,
  MAINTENANCE_TYPE_LABELS,
  VEHICLE_PAYMENT_CONCEPT_LABELS,
  VEHICLE_PAYMENT_STATUS_LABELS,
  VEHICLE_PAYMENT_STATUS_TONE,
  VEHICLE_STATUS_LABELS,
  VEHICLE_TYPE_LABELS,
} from "@/constants";
import { cn, formatNumber, formatMXN } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { driverName } from "@/lib/lookups";
import { toast } from "@/components/ui/toast";
import type { VehicleCompliancePayment, VehiclePaymentConcept, VehiclePaymentStatus, VehicleStatus, VehicleType } from "@/types";
import { useSessionStore } from "@/stores/session-store";
import { MOCK_USERS } from "@/mocks/users";
import { hasAdminPermission, permissionLabel } from "@/lib/admin-permissions";
import { hasDuplicateVehicleCode, hasDuplicateVehiclePlates, isFiniteNumber, normalizeCode } from "@/lib/admin-validation";

const VEHICLE_PAYMENT_TODAY = "2026-08-04";
const VEHICLE_PAYMENT_CONCEPTS = Object.keys(VEHICLE_PAYMENT_CONCEPT_LABELS) as VehiclePaymentConcept[];
const VEHICLE_PAYMENT_STATUSES = Object.keys(VEHICLE_PAYMENT_STATUS_LABELS) as VehiclePaymentStatus[];
const VEHICLE_TYPES = Object.keys(VEHICLE_TYPE_LABELS) as VehicleType[];
const VEHICLE_STATUSES = Object.keys(VEHICLE_STATUS_LABELS) as VehicleStatus[];

export default function VehicleDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const hydrated = useHydrated();
  const sessionUser = useSessionStore((s) => s.currentUser);
  const {
    vehicles,
    drivers,
    trips,
    fuel,
    maintenance,
    alerts,
    vehiclePayments,
    addVehiclePayment,
    updateVehiclePayment,
    deleteVehiclePayment,
    updateVehicle,
    deleteVehicle,
  } = useDemoStore();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!hydrated) return <Skeleton className="h-96 w-full" />;

  const user = sessionUser ?? MOCK_USERS[0];
  const canUpdate = hasAdminPermission(user.role, "admin:update");
  const canDelete = hasAdminPermission(user.role, "admin:delete");
  const vehicle = vehicles.find((v) => v.id === params.id);
  if (!vehicle) {
    return (
      <EmptyState
        title="Vehículo no encontrado"
        action={<Button onClick={() => router.push("/admin/vehicles")}>Volver</Button>}
      />
    );
  }

  const vehicleTrips = trips.filter((t) => t.vehicleId === vehicle.id);
  const vehicleFuel = fuel.filter((f) => f.vehicleId === vehicle.id);
  const vehicleMaint = maintenance.filter((m) => m.vehicleId === vehicle.id);
  const vehicleAlerts = alerts.filter((a) => a.vehicleId === vehicle.id);
  const payments = vehiclePayments
    .filter((payment) => payment.vehicleId === vehicle.id)
    .sort((a, b) => {
      if (a.status === "pagado" && b.status !== "pagado") return 1;
      if (a.status !== "pagado" && b.status === "pagado") return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });
  const overduePayments = payments.filter((payment) => isPaymentLate(payment));
  const nextPayment = payments.find((payment) => payment.status !== "pagado");
  const yearlyPaid = payments.filter((payment) => payment.status === "pagado" && payment.paidDate?.startsWith("2026")).length;
  const deleteImpact = {
    trips: vehicleTrips.length,
    fuel: vehicleFuel.length,
    maintenance: vehicleMaint.length,
    payments: payments.length,
    assignedDrivers: drivers.filter((driver) => driver.assignedVehicleId === vehicle.id).length,
  };

  const handleCreatePayment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canUpdate) {
      toast.warning(`Tu rol no puede ${permissionLabel("admin:update")}.`);
      return;
    }
    const formData = new FormData(event.currentTarget);
    const amount = Number(formData.get("amount") ?? 0);
    const dueDate = readFormString(formData, "dueDate");
    const description = readFormString(formData, "description");
    if (!description || !dueDate) {
      toast.warning("Agrega descripción y fecha límite.");
      return;
    }
    if (amount < 0) {
      toast.warning("El monto no puede ser negativo.");
      return;
    }
    const status = readFormString(formData, "status") as VehiclePaymentStatus;
    const payload: NewVehiclePaymentInput = {
      vehicleId: vehicle.id,
      concept: readFormString(formData, "concept") as VehiclePaymentConcept,
      description,
      amount,
      dueDate,
      paidDate: status === "pagado" ? readFormString(formData, "paidDate") || VEHICLE_PAYMENT_TODAY : undefined,
      status,
      provider: readFormString(formData, "provider") || undefined,
      reference: readFormString(formData, "reference") || undefined,
      notes: readFormString(formData, "notes") || undefined,
    };
    addVehiclePayment(payload);
    setPaymentOpen(false);
    toast.success("Obligación vehicular registrada en el DEMO.");
  };

  // Gráfica de kilometraje (odómetro acumulado mock)
  const kmData = vehicleFuel
    .slice()
    .reverse()
    .map((f, i) => ({ label: `C${i + 1}`, value: f.odometerKm }));

  const documentTone = (s: string) =>
    s === "vigente" ? "success" : s === "por_vencer" ? "warning" : "danger";

  return (
    <div>
      <PageHeader
        title={`${vehicle.code} · ${vehicle.brand} ${vehicle.model}`}
        description={`${VEHICLE_TYPE_LABELS[vehicle.type]} · ${vehicle.year} · ${vehicle.plates}`}
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Vehículos", href: "/admin/vehicles" },
          { label: vehicle.code },
        ]}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => router.push("/admin/vehicles")}>
              <ArrowLeft /> Volver
            </Button>
            <Button
              size="sm"
              disabled={!canUpdate}
              title={!canUpdate ? `Tu rol no puede ${permissionLabel("admin:update")}.` : undefined}
              onClick={() => setEditOpen(true)}
            >
              <Edit /> Editar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={!canDelete}
              title={!canDelete ? `Tu rol no puede ${permissionLabel("admin:delete")}.` : undefined}
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 /> Eliminar
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Información</CardTitle>
            <VehicleStatusBadge status={vehicle.status} />
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Capacidad" value={`${vehicle.capacity} pasajeros`} />
            <Row label="Kilometraje" value={`${formatNumber(vehicle.odometerKm)} km`} />
            <Row label="Próximo mantenimiento" value={`${formatNumber(vehicle.nextMaintenanceKm)} km`} />
            <Row label="Conductor asignado" value={driverName(drivers, vehicle.assignedDriverId)} />
            <Row label="Última ubicación" value={vehicle.lastLocationName} />
            <div>
              <p className="mb-1 text-xs text-muted-foreground">Nivel de combustible</p>
              <FuelBar level={vehicle.fuelLevel} />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-4 w-4" /> Kilometraje registrado
            </CardTitle>
          </CardHeader>
          <CardContent>
            {kmData.length > 1 ? (
              <SimpleLineChart data={kmData} unit="km" />
            ) : (
              <p className="text-sm text-muted-foreground">Datos insuficientes para graficar.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader className="gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" /> Pagos y obligaciones
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Tenencia, verificación, permisos y pólizas de la unidad. Datos mock para control interno.
            </p>
          </div>
          <Button
            size="sm"
            disabled={!canUpdate}
            title={!canUpdate ? `Tu rol no puede ${permissionLabel("admin:update")}.` : undefined}
            onClick={() => setPaymentOpen(true)}
          >
            <Plus /> Agregar registro
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <PaymentMetric icon={CalendarClock} label="Siguiente pago" value={nextPayment ? formatDate(nextPayment.dueDate, "dd MMM yyyy") : "Sin pendientes"} />
            <PaymentMetric icon={ShieldCheck} label="Pagados 2026" value={String(yearlyPaid)} tone="success" />
            <PaymentMetric icon={FileText} label="Vencidos" value={String(overduePayments.length)} tone={overduePayments.length > 0 ? "danger" : "success"} />
          </div>

          {payments.length === 0 ? (
            <p className="rounded-lg bg-muted p-4 text-center text-sm text-muted-foreground">
              No hay obligaciones registradas para esta unidad.
            </p>
          ) : (
            <div className="space-y-2">
              {payments.map((payment) => (
                <PaymentRow
                  key={payment.id}
                  payment={payment}
                  onMarkPaid={() => {
                    if (!canUpdate) {
                      toast.warning(`Tu rol no puede ${permissionLabel("admin:update")}.`);
                      return;
                    }
                    updateVehiclePayment(payment.id, { status: "pagado", paidDate: VEHICLE_PAYMENT_TODAY });
                    toast.success("Pago marcado como realizado.");
                  }}
                  onDelete={() => {
                    if (!canDelete) {
                      toast.warning(`Tu rol no puede ${permissionLabel("admin:delete")}.`);
                      return;
                    }
                    deleteVehiclePayment(payment.id);
                    toast.success("Registro eliminado del DEMO.");
                  }}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Historial de viajes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {vehicleTrips.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin viajes registrados.</p>
            ) : (
              vehicleTrips.slice(0, 6).map((t) => (
                <Link
                  key={t.id}
                  href={`/admin/trips/${t.id}`}
                  className="flex items-center justify-between gap-2 rounded-md border border-border p-2 text-sm hover:bg-secondary"
                >
                  <span>
                    <span className="font-medium">{t.folio}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{formatDate(t.date, "dd MMM")}</span>
                  </span>
                  <TripStatusBadge status={t.status} />
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Consumo de combustible</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {vehicleFuel.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin cargas registradas.</p>
            ) : (
              vehicleFuel.slice(0, 6).map((f) => (
                <div key={f.id} className="flex items-center justify-between rounded-md border border-border p-2 text-sm">
                  <span className="text-xs">
                    {formatDate(f.date, "dd MMM")} · {f.station}
                  </span>
                  <span className="text-xs tabular-nums">
                    {f.liters} L · {formatMXN(f.total)}
                    {f.performanceKmL && <span className="ml-2 text-muted-foreground">{f.performanceKmL} km/L</span>}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mantenimientos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {vehicleMaint.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin mantenimientos.</p>
            ) : (
              vehicleMaint.map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded-md border border-border p-2 text-sm">
                  <span className="text-xs">
                    {MAINTENANCE_TYPE_LABELS[m.type]} · {formatDate(m.scheduledDate, "dd MMM")}
                  </span>
                  <MaintenanceStatusBadge status={m.status} />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertas del vehículo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {vehicleAlerts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin alertas.</p>
            ) : (
              vehicleAlerts.map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-2 rounded-md border border-border p-2 text-sm">
                  <span className="text-xs">{ALERT_TYPE_LABELS[a.type]}</span>
                  <AlertPriorityBadge priority={a.priority} />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> Documentos (simulados)
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {vehicle.documents.map((d) => (
            <div key={d.id} className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
              <Car className="h-4 w-4 text-muted-foreground" />
              <span>{d.name}</span>
              <Badge tone={documentTone(d.status)}>{formatDate(d.expiresOn, "dd MMM yyyy")}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        title="Agregar obligación vehicular"
        description="Registra una fecha importante de pago para esta unidad. Todo queda en mocks del DEMO."
        className="max-w-2xl"
      >
        <form onSubmit={handleCreatePayment} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Concepto">
              <Select name="concept" defaultValue="poliza">
                {VEHICLE_PAYMENT_CONCEPTS.map((concept) => (
                  <option key={concept} value={concept}>
                    {VEHICLE_PAYMENT_CONCEPT_LABELS[concept]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Estado">
              <Select name="status" defaultValue="pendiente">
                {VEHICLE_PAYMENT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {VEHICLE_PAYMENT_STATUS_LABELS[status]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Fecha límite">
              <Input name="dueDate" type="date" defaultValue="2026-08-30" />
            </Field>
          </div>

          <Field label="Descripción">
            <Input name="description" placeholder="Ej. Renovación de póliza cobertura amplia" />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Monto">
              <Input name="amount" type="number" min={0} step={10} placeholder="18500" />
            </Field>
            <Field label="Proveedor / institución">
              <Input name="provider" placeholder="Aseguradora, verificentro, oficina" />
            </Field>
            <Field label="Folio / referencia">
              <Input name="reference" placeholder="POL-U01-2026" />
            </Field>
          </div>

          <Field label="Fecha de pago">
            <Input name="paidDate" type="date" placeholder="Solo si ya fue pagado" />
          </Field>

          <Field label="Notas">
            <Textarea name="notes" placeholder="Detalle opcional para seguimiento administrativo" />
          </Field>

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={() => setPaymentOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar registro</Button>
          </div>
        </form>
      </Dialog>

      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        side
        title="Editar vehículo"
        description="Actualiza la información operativa de la unidad en el DEMO."
      >
        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            if (!canUpdate) {
              toast.warning(`Tu rol no puede ${permissionLabel("admin:update")}.`);
              return;
            }
            const code = normalizeCode(readFormString(formData, "code"));
            const plates = normalizeCode(readFormString(formData, "plates"));
            const year = Number(formData.get("year") ?? vehicle.year);
            const capacity = Number(formData.get("capacity") ?? vehicle.capacity);
            const odometerKm = Number(formData.get("odometerKm") ?? vehicle.odometerKm);
            const nextMaintenanceKm = Number(formData.get("nextMaintenanceKm") ?? vehicle.nextMaintenanceKm);
            const fuelLevel = Number(formData.get("fuelLevel") ?? vehicle.fuelLevel);

            if (!code || !plates || !readFormString(formData, "brand") || !readFormString(formData, "model")) {
              toast.warning("Completa unidad, placas, marca y modelo.");
              return;
            }

            if (hasDuplicateVehicleCode(vehicles, code, vehicle.id)) {
              toast.warning("Ya existe otra unidad con ese código.");
              return;
            }

            if (hasDuplicateVehiclePlates(vehicles, plates, vehicle.id)) {
              toast.warning("Ya existe otro vehículo con esas placas.");
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

            updateVehicle(vehicle.id, {
              code,
              brand: readFormString(formData, "brand"),
              model: readFormString(formData, "model"),
              year,
              plates,
              capacity,
              type: readFormString(formData, "type") as VehicleType,
              status: readFormString(formData, "status") as VehicleStatus,
              odometerKm,
              nextMaintenanceKm,
              fuelLevel,
              assignedDriverId: readFormString(formData, "assignedDriverId") || null,
              lastLocationName: readFormString(formData, "lastLocationName") || vehicle.lastLocationName,
            });
            setEditOpen(false);
            toast.success("Vehículo actualizado en el DEMO.");
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Unidad"><Input name="code" defaultValue={vehicle.code} required /></Field>
            <Field label="Placas"><Input name="plates" defaultValue={vehicle.plates} required /></Field>
            <Field label="Marca"><Input name="brand" defaultValue={vehicle.brand} required /></Field>
            <Field label="Modelo"><Input name="model" defaultValue={vehicle.model} required /></Field>
            <Field label="Año"><Input name="year" type="number" min={2000} max={2030} defaultValue={vehicle.year} required /></Field>
            <Field label="Capacidad"><Input name="capacity" type="number" min={1} defaultValue={vehicle.capacity} required /></Field>
            <Field label="Tipo">
              <Select name="type" defaultValue={vehicle.type}>
                {VEHICLE_TYPES.map((type) => <option key={type} value={type}>{VEHICLE_TYPE_LABELS[type]}</option>)}
              </Select>
            </Field>
            <Field label="Estado">
              <Select name="status" defaultValue={vehicle.status}>
                {VEHICLE_STATUSES.map((status) => <option key={status} value={status}>{VEHICLE_STATUS_LABELS[status]}</option>)}
              </Select>
            </Field>
            <Field label="Kilometraje"><Input name="odometerKm" type="number" min={0} defaultValue={vehicle.odometerKm} required /></Field>
            <Field label="Próximo mantenimiento"><Input name="nextMaintenanceKm" type="number" min={0} defaultValue={vehicle.nextMaintenanceKm} required /></Field>
            <Field label="Combustible (%)"><Input name="fuelLevel" type="number" min={0} max={100} defaultValue={vehicle.fuelLevel} required /></Field>
            <Field label="Conductor asignado">
              <Select name="assignedDriverId" defaultValue={vehicle.assignedDriverId ?? ""}>
                <option value="">Sin asignar</option>
                {drivers.map((driver) => <option key={driver.id} value={driver.id}>{driver.name}</option>)}
              </Select>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Última ubicación"><Input name="lastLocationName" defaultValue={vehicle.lastLocationName} /></Field>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button type="submit">Guardar cambios</Button>
          </div>
        </form>
      </Dialog>

      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Eliminar vehículo"
        description="Se quitará del DEMO y se limpiarán los registros relacionados. Esta acción solo afecta datos locales mock."
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-destructive/20 bg-destructive-soft p-3 text-sm text-destructive">
            Impacto: {deleteImpact.trips} servicio(s), {deleteImpact.assignedDrivers} conductor(es) asignado(s),{" "}
            {deleteImpact.fuel} carga(s), {deleteImpact.maintenance} mantenimiento(s) y {deleteImpact.payments} obligación(es).
          </div>
          <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancelar</Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (!canDelete) {
                toast.warning(`Tu rol no puede ${permissionLabel("admin:delete")}.`);
                return;
              }
              deleteVehicle(vehicle.id);
              toast.success("Vehículo eliminado del DEMO.");
              router.push("/admin/vehicles");
            }}
          >
            <Trash2 /> Eliminar
          </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function PaymentMetric({
  icon: Icon,
  label,
  value,
  tone = "neutral",
}: {
  icon: typeof CalendarClock;
  label: string;
  value: string;
  tone?: "neutral" | "success" | "danger";
}) {
  const toneClass =
    tone === "danger" ? "text-destructive" : tone === "success" ? "text-success" : "text-muted-foreground";
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className={cn("h-3.5 w-3.5", toneClass)} /> {label}
      </div>
      <p className="mt-1 font-heading text-lg font-bold">{value}</p>
    </div>
  );
}

function PaymentRow({
  payment,
  onMarkPaid,
  onDelete,
}: {
  payment: VehicleCompliancePayment;
  onMarkPaid: () => void;
  onDelete: () => void;
}) {
  const late = isPaymentLate(payment);
  const days = daysUntil(payment.dueDate);
  const tone = late ? "danger" : VEHICLE_PAYMENT_STATUS_TONE[payment.status];
  return (
    <div className="grid gap-3 rounded-lg border border-border p-3 md:grid-cols-[1fr_auto] md:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={tone}>{late ? "Vencido" : VEHICLE_PAYMENT_STATUS_LABELS[payment.status]}</Badge>
          <p className="font-semibold">{VEHICLE_PAYMENT_CONCEPT_LABELS[payment.concept]}</p>
          <span className="text-sm text-muted-foreground">{formatMXN(payment.amount)}</span>
        </div>
        <p className="mt-1 text-sm">{payment.description}</p>
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className={late ? "font-semibold text-destructive" : undefined}>
            Vence {formatDate(payment.dueDate, "dd MMM yyyy")}
            {payment.status !== "pagado" && ` · ${late ? `hace ${Math.abs(days)} día(s)` : `en ${days} día(s)`}`}
          </span>
          {payment.paidDate && <span>Pagado {formatDate(payment.paidDate, "dd MMM yyyy")}</span>}
          {payment.provider && <span>{payment.provider}</span>}
          {payment.reference && <span>{payment.reference}</span>}
        </div>
        {payment.notes && <p className="mt-2 rounded-md bg-secondary/60 p-2 text-xs text-muted-foreground">{payment.notes}</p>}
      </div>
      <div className="flex justify-end gap-2">
        {payment.status !== "pagado" && (
          <Button size="sm" variant="outline" onClick={onMarkPaid}>
            <ShieldCheck /> Pagado
          </Button>
        )}
        <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive-soft" onClick={onDelete}>
          <Trash2 /> Eliminar
        </Button>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
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

function daysUntil(date: string) {
  const dayMs = 86_400_000;
  const target = Date.parse(`${date}T00:00:00`);
  const today = Date.parse(`${VEHICLE_PAYMENT_TODAY}T00:00:00`);
  return Math.ceil((target - today) / dayMs);
}

function isPaymentLate(payment: VehicleCompliancePayment) {
  return payment.status !== "pagado" && (payment.status === "vencido" || payment.dueDate < VEHICLE_PAYMENT_TODAY);
}
