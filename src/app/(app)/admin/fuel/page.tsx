"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { CheckCircle2, Edit, Fuel, TrendingDown, AlertCircle, Download, Plus, Trash2 } from "lucide-react";
import { useDemoStore } from "@/stores/demo-store";
import { useHydrated } from "@/lib/hooks";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/misc";
import { DataTable, type Column, type FilterConfig } from "@/components/shared/data-table";
import { SimpleBarChart } from "@/components/charts/charts";
import { FuelValidationBadge } from "@/components/shared/badges";
import { FUEL_VALIDATION_LABELS } from "@/constants";
import type { FuelRecord, FuelValidation, PaymentMethod } from "@/types";
import { formatMXN, formatNumber } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { toast } from "@/components/ui/toast";
import { exportToCsv } from "@/lib/csv";
import { useSessionStore } from "@/stores/session-store";
import { MOCK_USERS } from "@/mocks/users";
import { hasAdminPermission, permissionLabel } from "@/lib/admin-permissions";
import { isFiniteNumber } from "@/lib/admin-validation";

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  efectivo: "Efectivo",
  tarjeta_flota: "Tarjeta de flota",
  vale: "Vale",
};

const FUEL_VALIDATIONS = Object.keys(FUEL_VALIDATION_LABELS) as FuelValidation[];
const PAYMENT_METHODS = Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[];

export default function FuelPage() {
  const hydrated = useHydrated();
  const sessionUser = useSessionStore((s) => s.currentUser);
  const { fuel, vehicles, drivers, addFuelRecord, updateFuelRecord, deleteFuelRecord } = useDemoStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<FuelRecord | null>(null);

  useEffect(() => {
    if (window.location.search.includes("new=1")) {
      setCreateOpen(true);
    }
  }, []);

  if (!hydrated) return <Skeleton className="h-96 w-full" />;

  const user = sessionUser ?? MOCK_USERS[0];
  const canCreate = hasAdminPermission(user.role, "admin:create");
  const canUpdate = hasAdminPermission(user.role, "admin:update");
  const canDelete = hasAdminPermission(user.role, "admin:delete");
  const canValidate = hasAdminPermission(user.role, "admin:validate");
  const vehicleName = (id: string) => vehicles.find((v) => v.id === id)?.code ?? id;
  const driverNm = (id: string) => drivers.find((d) => d.id === id)?.name ?? id;

  const totalLiters = fuel.reduce((s, f) => s + f.liters, 0);
  const totalCost = fuel.reduce((s, f) => s + f.total, 0);
  const anomalies = fuel.filter((f) => f.validation === "por_revisar");
  const avgPerf =
    fuel.filter((f) => f.performanceKmL).reduce((s, f) => s + (f.performanceKmL ?? 0), 0) /
    (fuel.filter((f) => f.performanceKmL).length || 1);

  // Consumo (litros) por unidad
  const consumptionByVehicle = vehicles.map((v) => ({
    label: v.code,
    value: fuel.filter((f) => f.vehicleId === v.id).reduce((s, f) => s + f.liters, 0),
  }));

  // Rendimiento (km/L) por unidad
  const perfByVehicle = vehicles.map((v) => {
    const recs = fuel.filter((f) => f.vehicleId === v.id && f.performanceKmL);
    const avg = recs.reduce((s, f) => s + (f.performanceKmL ?? 0), 0) / (recs.length || 1);
    return { label: v.code, value: Number(avg.toFixed(1)), color: avg < 6 ? "#EAA33D" : "#9DC52D" };
  });

  const columns: Column<FuelRecord>[] = [
    { key: "date", header: "Fecha", render: (f) => <span className="text-xs">{formatDate(f.date, "dd MMM · HH:mm")}</span> },
    { key: "vehicle", header: "Unidad", render: (f) => <span className="font-medium">{vehicleName(f.vehicleId)}</span> },
    { key: "driver", header: "Conductor", render: (f) => <span className="text-xs">{driverNm(f.driverId)}</span> },
    { key: "liters", header: "Litros", render: (f) => <span className="tabular-nums">{f.liters}</span> },
    { key: "price", header: "$/L", render: (f) => <span className="tabular-nums">{f.pricePerLiter}</span> },
    { key: "total", header: "Total", render: (f) => <span className="tabular-nums">{formatMXN(f.total)}</span> },
    { key: "odo", header: "Kilometraje", render: (f) => <span className="tabular-nums">{formatNumber(f.odometerKm)}</span> },
    { key: "station", header: "Estación", render: (f) => <span className="text-xs">{f.station}</span> },
    { key: "perf", header: "Rendimiento", render: (f) => <span className="tabular-nums">{f.performanceKmL ? `${f.performanceKmL} km/L` : "—"}</span> },
    { key: "ticket", header: "Ticket", render: (f) => <span className="text-xs">{f.hasTicket ? "✓ Adjunto" : "—"}</span> },
    { key: "validation", header: "Validación", render: (f) => <FuelValidationBadge status={f.validation} /> },
    {
      key: "actions",
      header: "Acciones",
      render: (f) => (
        <div className="flex justify-end gap-1" onClick={(event) => event.stopPropagation()}>
          {f.validation !== "validado" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                updateFuelRecord(f.id, { validation: "validado", anomalyNote: undefined });
                toast.success("Carga validada en el DEMO.");
              }}
              disabled={!canValidate}
              title={!canValidate ? `Tu rol no puede ${permissionLabel("admin:validate")}.` : undefined}
            >
              <CheckCircle2 /> Validar
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            disabled={!canUpdate}
            title={!canUpdate ? `Tu rol no puede ${permissionLabel("admin:update")}.` : undefined}
            onClick={() => setEditRecord(f)}
          >
            <Edit /> Editar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            disabled={!canDelete}
            title={!canDelete ? `Tu rol no puede ${permissionLabel("admin:delete")}.` : undefined}
            onClick={() => {
              deleteFuelRecord(f.id);
              toast.success("Carga eliminada del DEMO.");
            }}
          >
            <Trash2 /> Eliminar
          </Button>
        </div>
      ),
      className: "text-right",
    },
  ];

  const filters: FilterConfig<FuelRecord>[] = [
    {
      label: "Validación",
      options: (Object.keys(FUEL_VALIDATION_LABELS) as FuelValidation[]).map((s) => ({
        value: s,
        label: FUEL_VALIDATION_LABELS[s],
      })),
      predicate: (f, v) => f.validation === v,
    },
  ];

  const handleExport = () => {
    exportToCsv(
      "combustible_greengo",
      fuel.map((f) => ({
        Fecha: formatDate(f.date, "yyyy-MM-dd HH:mm"),
        Unidad: vehicleName(f.vehicleId),
        Conductor: driverNm(f.driverId),
        Litros: f.liters,
        PrecioLitro: f.pricePerLiter,
        Total: f.total,
        Kilometraje: f.odometerKm,
        Estacion: f.station,
        RendimientoKmL: f.performanceKmL ?? "",
        Validacion: FUEL_VALIDATION_LABELS[f.validation],
      })),
    );
    toast.success("Reporte de combustible exportado (CSV).");
  };

  const handleCreateFuel = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canCreate) {
      toast.warning(`Tu rol no puede ${permissionLabel("admin:create")}.`);
      return;
    }
    const formData = new FormData(event.currentTarget);
    const vehicleId = readFormString(formData, "vehicleId");
    const driverId = readFormString(formData, "driverId");
    const date = readFormString(formData, "date");
    const liters = Number(formData.get("liters") ?? 0);
    const pricePerLiter = Number(formData.get("pricePerLiter") ?? 0);
    const odometerKm = Number(formData.get("odometerKm") ?? 0);
    const station = readFormString(formData, "station");
    const performanceValue = readFormString(formData, "performanceKmL");

    if (!vehicleId || !driverId || !date || !station) {
      toast.warning("Selecciona unidad, conductor, fecha y estación.");
      return;
    }

    if (![liters, pricePerLiter, odometerKm].every(isFiniteNumber) || liters <= 0 || pricePerLiter <= 0 || odometerKm < 0) {
      toast.warning("Revisa litros, precio por litro y kilometraje.");
      return;
    }

    addFuelRecord({
      vehicleId,
      driverId,
      date,
      liters,
      pricePerLiter,
      total: Number((liters * pricePerLiter).toFixed(2)),
      odometerKm,
      station,
      paymentMethod: readFormString(formData, "paymentMethod") as PaymentMethod,
      performanceKmL: performanceValue ? Number(performanceValue) : null,
      validation: readFormString(formData, "validation") as FuelValidation,
      anomalyNote: readFormString(formData, "anomalyNote") || undefined,
      hasTicket: formData.get("hasTicket") === "on",
    });
    setCreateOpen(false);
    toast.success("Carga de combustible agregada al DEMO.");
  };

  return (
    <div>
      <PageHeader
        title="Combustible"
        description="Cargas, rendimiento y anomalías por revisar."
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Combustible" }]}
        actions={
          <>
            <Button
              size="sm"
              disabled={!canCreate}
              title={!canCreate ? `Tu rol no puede ${permissionLabel("admin:create")}.` : undefined}
              onClick={() => setCreateOpen(true)}
            >
              <Plus /> Registrar carga
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download /> Exportar CSV
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Litros cargados" value={`${formatNumber(totalLiters)} L`} icon={Fuel} tone="primary" />
        <KpiCard label="Gasto total" value={formatMXN(totalCost)} icon={Fuel} tone="neutral" />
        <KpiCard label="Rendimiento prom." value={`${avgPerf.toFixed(1)} km/L`} icon={TrendingDown} tone="success" />
        <KpiCard label="Anomalías por revisar" value={anomalies.length} icon={AlertCircle} tone="danger" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Consumo por unidad (litros)</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={consumptionByVehicle} unit="L" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Rendimiento por vehículo (km/L)</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={perfByVehicle} unit="km/L" />
          </CardContent>
        </Card>
      </div>

      {anomalies.length > 0 && (
        <Card className="mt-4 border-warning/30 bg-warning-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertCircle className="h-4 w-4" /> Anomalías por revisar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-warning/90">
              Variaciones de consumo respecto al promedio de la unidad. Requieren revisión
              y evidencia; no implican una conclusión automática.
            </p>
            {anomalies.map((f) => (
              <div key={f.id} className="rounded-md border border-warning/25 bg-card p-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{vehicleName(f.vehicleId)} · {formatDate(f.date, "dd MMM")}</span>
                  <FuelValidationBadge status={f.validation} />
                </div>
                {f.anomalyNote && <p className="mt-1 text-xs text-muted-foreground">{f.anomalyNote}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="mt-4">
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Cargas recientes</h2>
        <DataTable
          columns={columns}
          rows={fuel}
          getRowId={(f) => f.id}
          searchPlaceholder="Buscar por estación…"
          searchAccessor={(f) => `${f.station} ${vehicleName(f.vehicleId)}`}
          filters={filters}
          renderMobileCard={(f) => (
            <FuelMobileCard
              record={f}
              vehicle={vehicleName(f.vehicleId)}
              driver={driverNm(f.driverId)}
              canValidate={canValidate}
              canUpdate={canUpdate}
              canDelete={canDelete}
              onValidate={() => {
                updateFuelRecord(f.id, { validation: "validado", anomalyNote: undefined });
                toast.success("Carga validada en el DEMO.");
              }}
              onEdit={() => setEditRecord(f)}
              onDelete={() => {
                deleteFuelRecord(f.id);
                toast.success("Carga eliminada del DEMO.");
              }}
            />
          )}
          emptyTitle="Sin cargas de combustible"
          emptyDescription="Registra cargas para revisar consumo, costos y rendimiento por unidad."
          emptyAction={
            <Button size="sm" disabled={!canCreate} onClick={() => setCreateOpen(true)}>
              <Plus /> Registrar carga
            </Button>
          }
        />
      </div>

      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        side
        title="Registrar combustible"
        description="Captura una carga mock para actualizar consumo, costos y anomalías."
      >
        <form className="space-y-5" onSubmit={handleCreateFuel}>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Unidad">
              <Select name="vehicleId" defaultValue="" required>
                <option value="" disabled>
                  Selecciona unidad
                </option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.code} · {vehicle.brand} {vehicle.model}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Conductor">
              <Select name="driverId" defaultValue="" required>
                <option value="" disabled>
                  Selecciona conductor
                </option>
                {drivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Fecha y hora">
              <Input name="date" type="datetime-local" defaultValue="2026-08-04T09:00" required />
            </FormField>
            <FormField label="Estación">
              <Input name="station" placeholder="Pemex Av. Tulum" required />
            </FormField>
            <FormField label="Litros">
              <Input name="liters" type="number" min={0.1} step={0.1} defaultValue={40} required />
            </FormField>
            <FormField label="Precio por litro">
              <Input name="pricePerLiter" type="number" min={0.1} step={0.1} defaultValue={24} required />
            </FormField>
            <FormField label="Kilometraje">
              <Input name="odometerKm" type="number" min={0} defaultValue={0} required />
            </FormField>
            <FormField label="Rendimiento km/L">
              <Input name="performanceKmL" type="number" min={0} step={0.1} placeholder="8.5" />
            </FormField>
            <FormField label="Método de pago">
              <Select name="paymentMethod" defaultValue="tarjeta_flota">
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {PAYMENT_METHOD_LABELS[method]}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Validación">
              <Select name="validation" defaultValue="pendiente">
                {FUEL_VALIDATIONS.map((status) => (
                  <option key={status} value={status}>
                    {FUEL_VALIDATION_LABELS[status]}
                  </option>
                ))}
              </Select>
            </FormField>
            <label className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm font-medium">
              <input name="hasTicket" type="checkbox" className="h-4 w-4 rounded border-input" defaultChecked />
              Ticket adjunto
            </label>
            <div className="sm:col-span-2">
              <FormField label="Observación">
                <Textarea name="anomalyNote" placeholder="Evidencia pendiente, variación de consumo, comentario del conductor..." />
              </FormField>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-secondary/50 p-3 text-sm text-muted-foreground">
            El total se calcula automáticamente con litros por precio por litro.
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              <Plus /> Guardar carga
            </Button>
          </div>
        </form>
      </Dialog>

      <Dialog
        open={Boolean(editRecord)}
        onClose={() => setEditRecord(null)}
        side
        title="Editar combustible"
        description="Actualiza la carga y su validación en el DEMO."
      >
        {editRecord && (
          <FuelForm
            vehicles={vehicles}
            drivers={drivers}
            defaultRecord={editRecord}
            submitLabel="Guardar cambios"
            onCancel={() => setEditRecord(null)}
            onSubmit={(record) => {
              if (!canUpdate) {
                toast.warning(`Tu rol no puede ${permissionLabel("admin:update")}.`);
                return;
              }
              updateFuelRecord(editRecord.id, record);
              setEditRecord(null);
              toast.success("Carga actualizada en el DEMO.");
            }}
          />
        )}
      </Dialog>
    </div>
  );
}

function FuelForm({
  vehicles,
  drivers,
  defaultRecord,
  submitLabel,
  onCancel,
  onSubmit,
}: {
  vehicles: Array<{ id: string; code: string; brand: string; model: string }>;
  drivers: Array<{ id: string; name: string }>;
  defaultRecord: FuelRecord;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (record: Omit<FuelRecord, "id">) => void;
}) {
  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const liters = Number(formData.get("liters") ?? 0);
        const pricePerLiter = Number(formData.get("pricePerLiter") ?? 0);
        const odometerKm = Number(formData.get("odometerKm") ?? 0);
        const performanceValue = readFormString(formData, "performanceKmL");
        if (
          !readFormString(formData, "vehicleId") ||
          !readFormString(formData, "driverId") ||
          !readFormString(formData, "date") ||
          !readFormString(formData, "station")
        ) {
          toast.warning("Selecciona unidad, conductor, fecha y estación.");
          return;
        }
        if (![liters, pricePerLiter, odometerKm].every(isFiniteNumber) || liters <= 0 || pricePerLiter <= 0 || odometerKm < 0) {
          toast.warning("Revisa litros, precio por litro y kilometraje.");
          return;
        }
        onSubmit({
          vehicleId: readFormString(formData, "vehicleId"),
          driverId: readFormString(formData, "driverId"),
          date: readFormString(formData, "date"),
          liters,
          pricePerLiter,
          total: Number((liters * pricePerLiter).toFixed(2)),
          odometerKm,
          station: readFormString(formData, "station"),
          paymentMethod: readFormString(formData, "paymentMethod") as PaymentMethod,
          performanceKmL: performanceValue ? Number(performanceValue) : null,
          validation: readFormString(formData, "validation") as FuelValidation,
          anomalyNote: readFormString(formData, "anomalyNote") || undefined,
          hasTicket: formData.get("hasTicket") === "on",
        });
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Unidad">
          <Select name="vehicleId" defaultValue={defaultRecord.vehicleId} required>
            {vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.code} · {vehicle.brand} {vehicle.model}</option>)}
          </Select>
        </FormField>
        <FormField label="Conductor">
          <Select name="driverId" defaultValue={defaultRecord.driverId} required>
            {drivers.map((driver) => <option key={driver.id} value={driver.id}>{driver.name}</option>)}
          </Select>
        </FormField>
        <FormField label="Fecha y hora"><Input name="date" type="datetime-local" defaultValue={defaultRecord.date.slice(0, 16)} required /></FormField>
        <FormField label="Estación"><Input name="station" defaultValue={defaultRecord.station} required /></FormField>
        <FormField label="Litros"><Input name="liters" type="number" min={0.1} step={0.1} defaultValue={defaultRecord.liters} required /></FormField>
        <FormField label="Precio por litro"><Input name="pricePerLiter" type="number" min={0.1} step={0.1} defaultValue={defaultRecord.pricePerLiter} required /></FormField>
        <FormField label="Kilometraje"><Input name="odometerKm" type="number" min={0} defaultValue={defaultRecord.odometerKm} required /></FormField>
        <FormField label="Rendimiento km/L"><Input name="performanceKmL" type="number" min={0} step={0.1} defaultValue={defaultRecord.performanceKmL ?? ""} /></FormField>
        <FormField label="Método de pago">
          <Select name="paymentMethod" defaultValue={defaultRecord.paymentMethod}>
            {PAYMENT_METHODS.map((method) => <option key={method} value={method}>{PAYMENT_METHOD_LABELS[method]}</option>)}
          </Select>
        </FormField>
        <FormField label="Validación">
          <Select name="validation" defaultValue={defaultRecord.validation}>
            {FUEL_VALIDATIONS.map((status) => <option key={status} value={status}>{FUEL_VALIDATION_LABELS[status]}</option>)}
          </Select>
        </FormField>
        <label className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm font-medium">
          <input name="hasTicket" type="checkbox" className="h-4 w-4 rounded border-input" defaultChecked={defaultRecord.hasTicket} />
          Ticket adjunto
        </label>
        <div className="sm:col-span-2">
          <FormField label="Observación"><Textarea name="anomalyNote" defaultValue={defaultRecord.anomalyNote ?? ""} /></FormField>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}

function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function FuelMobileCard({
  record,
  vehicle,
  driver,
  canValidate,
  canUpdate,
  canDelete,
  onValidate,
  onEdit,
  onDelete,
}: {
  record: FuelRecord;
  vehicle: string;
  driver: string;
  canValidate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  onValidate: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold">{vehicle} · {formatMXN(record.total)}</p>
          <p className="text-xs text-muted-foreground">{formatDate(record.date, "dd MMM · HH:mm")} · {record.station}</p>
        </div>
        <FuelValidationBadge status={record.validation} />
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <Info label="Conductor" value={driver} />
        <Info label="Litros" value={`${record.liters} L`} />
        <Info label="$/L" value={formatMXN(record.pricePerLiter)} />
        <Info label="Km" value={formatNumber(record.odometerKm)} />
      </div>
      <div className="flex flex-wrap justify-end gap-1.5">
        {record.validation !== "validado" && (
          <Button variant="ghost" size="sm" disabled={!canValidate} onClick={onValidate}>
            <CheckCircle2 /> Validar
          </Button>
        )}
        <Button variant="ghost" size="sm" disabled={!canUpdate} onClick={onEdit}>
          <Edit /> Editar
        </Button>
        <Button variant="ghost" size="sm" disabled={!canDelete} className="text-destructive" onClick={onDelete}>
          <Trash2 /> Eliminar
        </Button>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-muted-foreground">{label}</p>
      <p className="truncate font-medium">{value}</p>
    </div>
  );
}

function readFormString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}
