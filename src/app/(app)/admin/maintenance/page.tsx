"use client";

import { Wrench, CalendarClock, CheckCircle2, CircleAlert, Edit, Plus, Trash2 } from "lucide-react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useDemoStore, type NewMaintenanceInput } from "@/stores/demo-store";
import { useHydrated } from "@/lib/hooks";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { Skeleton } from "@/components/ui/misc";
import { DataTable, type Column, type FilterConfig } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { MaintenanceStatusBadge } from "@/components/shared/badges";
import { MAINTENANCE_STATUS_LABELS, MAINTENANCE_TYPE_LABELS } from "@/constants";
import type { MaintenanceRecord, MaintenanceStatus, MaintenanceType } from "@/types";
import { formatMXN, formatNumber } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { toast } from "@/components/ui/toast";
import { useSessionStore } from "@/stores/session-store";
import { MOCK_USERS } from "@/mocks/users";
import { hasAdminPermission, permissionLabel } from "@/lib/admin-permissions";
import { isFiniteNumber } from "@/lib/admin-validation";

const MAINTENANCE_TYPES = Object.keys(MAINTENANCE_TYPE_LABELS) as MaintenanceType[];
const MAINTENANCE_STATUSES = Object.keys(MAINTENANCE_STATUS_LABELS) as MaintenanceStatus[];

export default function MaintenancePage() {
  const hydrated = useHydrated();
  const sessionUser = useSessionStore((s) => s.currentUser);
  const { maintenance, vehicles, createMaintenance, updateMaintenance, deleteMaintenance } = useDemoStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<MaintenanceRecord | null>(null);

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
  const vehicleName = (id: string) => vehicles.find((v) => v.id === id)?.code ?? id;

  const scheduled = maintenance.filter((m) => m.status === "programado").length;
  const overdue = maintenance.filter((m) => m.status === "vencido").length;
  const totalCost = maintenance.reduce((s, m) => s + m.estimatedCost, 0);

  const handleCreateMaintenance = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canCreate) {
      toast.warning(`Tu rol no puede ${permissionLabel("admin:create")}.`);
      return;
    }
    const formData = new FormData(event.currentTarget);
    const vehicleId = readFormString(formData, "vehicleId");
    const scheduledDate = readFormString(formData, "scheduledDate");
    const workshop = readFormString(formData, "workshop");
    const currentKm = Number(formData.get("currentKm") ?? 0);
    const limitKm = Number(formData.get("limitKm") ?? 0);
    const estimatedCost = Number(formData.get("estimatedCost") ?? 0);

    if (!vehicleId || !scheduledDate || !workshop) {
      toast.warning("Selecciona unidad, fecha programada y taller.");
      return;
    }

    if (![currentKm, limitKm, estimatedCost].every(isFiniteNumber) || currentKm < 0 || limitKm <= 0 || estimatedCost < 0) {
      toast.warning("Revisa kilometraje, límite y costo estimado.");
      return;
    }

    const record: NewMaintenanceInput = {
      vehicleId,
      type: readFormString(formData, "type") as MaintenanceType,
      currentKm,
      limitKm,
      scheduledDate,
      status: readFormString(formData, "status") as MaintenanceStatus,
      estimatedCost,
      workshop,
      notes: readFormString(formData, "notes") || undefined,
    };

    const created = createMaintenance(record);
    setCreateOpen(false);
    toast.success(`Mantenimiento ${MAINTENANCE_TYPE_LABELS[created.type].toLowerCase()} agregado al DEMO.`);
  };

  const columns: Column<MaintenanceRecord>[] = [
    { key: "vehicle", header: "Unidad", render: (m) => <span className="font-medium">{vehicleName(m.vehicleId)}</span> },
    { key: "type", header: "Tipo", render: (m) => MAINTENANCE_TYPE_LABELS[m.type] },
    { key: "km", header: "Km actual / límite", render: (m) => <span className="tabular-nums text-xs">{formatNumber(m.currentKm)} / {formatNumber(m.limitKm)}</span> },
    { key: "date", header: "Fecha programada", render: (m) => <span className="text-xs">{formatDate(m.scheduledDate)}</span> },
    { key: "cost", header: "Costo estimado", render: (m) => <span className="tabular-nums">{formatMXN(m.estimatedCost)}</span> },
    { key: "workshop", header: "Taller", render: (m) => <span className="text-xs">{m.workshop}</span> },
    { key: "notes", header: "Observaciones", render: (m) => <span className="text-xs text-muted-foreground">{m.notes ?? "—"}</span> },
    { key: "status", header: "Estado", render: (m) => <MaintenanceStatusBadge status={m.status} /> },
    {
      key: "actions",
      header: "Acciones",
      render: (m) => (
        <div className="flex justify-end gap-1" onClick={(event) => event.stopPropagation()}>
          {m.status !== "completado" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                updateMaintenance(m.id, { status: "completado" });
                toast.success("Mantenimiento marcado como completado.");
              }}
              disabled={!canUpdate}
              title={!canUpdate ? `Tu rol no puede ${permissionLabel("admin:update")}.` : undefined}
            >
              <CheckCircle2 /> Completar
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            disabled={!canUpdate}
            title={!canUpdate ? `Tu rol no puede ${permissionLabel("admin:update")}.` : undefined}
            onClick={() => setEditRecord(m)}
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
              deleteMaintenance(m.id);
              toast.success("Mantenimiento eliminado del DEMO.");
            }}
          >
            <Trash2 /> Eliminar
          </Button>
        </div>
      ),
      className: "text-right",
    },
  ];

  const filters: FilterConfig<MaintenanceRecord>[] = [
    {
      label: "Estado",
      options: (Object.keys(MAINTENANCE_STATUS_LABELS) as MaintenanceStatus[]).map((s) => ({
        value: s,
        label: MAINTENANCE_STATUS_LABELS[s],
      })),
      predicate: (m, v) => m.status === v,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Mantenimiento"
        description="Programación y seguimiento de servicios de la flota."
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Mantenimiento" }]}
        actions={
          <Button
            size="sm"
            disabled={!canCreate}
            title={!canCreate ? `Tu rol no puede ${permissionLabel("admin:create")}.` : undefined}
            onClick={() => setCreateOpen(true)}
          >
            <Plus /> Programar mantenimiento
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Programados" value={scheduled} icon={CalendarClock} tone="primary" />
        <KpiCard label="Vencidos" value={overdue} icon={CircleAlert} tone="danger" />
        <KpiCard label="Registros totales" value={maintenance.length} icon={Wrench} tone="neutral" />
        <KpiCard label="Costo estimado total" value={formatMXN(totalCost)} icon={Wrench} tone="warning" />
      </div>

      <div className="mt-6">
        <DataTable
          columns={columns}
          rows={maintenance}
          getRowId={(m) => m.id}
          searchPlaceholder="Buscar por unidad o taller…"
          searchAccessor={(m) => `${vehicleName(m.vehicleId)} ${m.workshop}`}
          filters={filters}
          renderMobileCard={(m) => (
            <MaintenanceMobileCard
              record={m}
              vehicle={vehicleName(m.vehicleId)}
              canUpdate={canUpdate}
              canDelete={canDelete}
              onComplete={() => {
                updateMaintenance(m.id, { status: "completado" });
                toast.success("Mantenimiento marcado como completado.");
              }}
              onEdit={() => setEditRecord(m)}
              onDelete={() => {
                deleteMaintenance(m.id);
                toast.success("Mantenimiento eliminado del DEMO.");
              }}
            />
          )}
          emptyTitle="Sin mantenimientos"
          emptyDescription="Programa un servicio para controlar fechas, kilometraje y costos."
          emptyAction={
            <Button size="sm" disabled={!canCreate} onClick={() => setCreateOpen(true)}>
              <Plus /> Programar mantenimiento
            </Button>
          }
        />
      </div>

      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        side
        title="Programar mantenimiento"
        description="Registra un servicio mock para controlar fechas, costos y seguimiento de la flota."
      >
        <form className="space-y-5" onSubmit={handleCreateMaintenance}>
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
            <FormField label="Tipo de servicio">
              <Select name="type" defaultValue="preventivo">
                {MAINTENANCE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {MAINTENANCE_TYPE_LABELS[type]}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Estado">
              <Select name="status" defaultValue="programado">
                {MAINTENANCE_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {MAINTENANCE_STATUS_LABELS[status]}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Fecha programada">
              <Input name="scheduledDate" type="date" defaultValue="2026-08-15" required />
            </FormField>
            <FormField label="Km actual">
              <Input name="currentKm" type="number" min={0} defaultValue={0} required />
            </FormField>
            <FormField label="Km límite">
              <Input name="limitKm" type="number" min={1} defaultValue={10000} required />
            </FormField>
            <FormField label="Costo estimado">
              <Input name="estimatedCost" type="number" min={0} step={100} defaultValue={0} required />
            </FormField>
            <FormField label="Taller">
              <Input name="workshop" placeholder="Taller Central GreenGo" required />
            </FormField>
            <div className="sm:col-span-2">
              <FormField label="Observaciones">
                <Textarea name="notes" placeholder="Cambio de aceite, revisión de frenos, diagnóstico eléctrico..." />
              </FormField>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-secondary/50 p-3 text-sm text-muted-foreground">
            Al guardar se agrega el mantenimiento al DEMO y se actualizan los indicadores de la sección.
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              <Plus /> Guardar mantenimiento
            </Button>
          </div>
        </form>
      </Dialog>

      <Dialog
        open={Boolean(editRecord)}
        onClose={() => setEditRecord(null)}
        side
        title="Editar mantenimiento"
        description="Actualiza el seguimiento del servicio en el DEMO."
      >
        {editRecord && (
          <MaintenanceForm
            vehicles={vehicles}
            defaultRecord={editRecord}
            submitLabel="Guardar cambios"
            onCancel={() => setEditRecord(null)}
            onSubmit={(record) => {
              if (!canUpdate) {
                toast.warning(`Tu rol no puede ${permissionLabel("admin:update")}.`);
                return;
              }
              updateMaintenance(editRecord.id, record);
              setEditRecord(null);
              toast.success("Mantenimiento actualizado en el DEMO.");
            }}
          />
        )}
      </Dialog>
    </div>
  );
}

function MaintenanceForm({
  vehicles,
  defaultRecord,
  submitLabel,
  onCancel,
  onSubmit,
}: {
  vehicles: Array<{ id: string; code: string; brand: string; model: string }>;
  defaultRecord: MaintenanceRecord;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (record: NewMaintenanceInput) => void;
}) {
  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const currentKm = Number(formData.get("currentKm") ?? 0);
        const limitKm = Number(formData.get("limitKm") ?? 0);
        const estimatedCost = Number(formData.get("estimatedCost") ?? 0);
        if (!readFormString(formData, "vehicleId") || !readFormString(formData, "scheduledDate") || !readFormString(formData, "workshop")) {
          toast.warning("Selecciona unidad, fecha programada y taller.");
          return;
        }
        if (![currentKm, limitKm, estimatedCost].every(isFiniteNumber) || currentKm < 0 || limitKm <= 0 || estimatedCost < 0) {
          toast.warning("Revisa kilometraje, límite y costo estimado.");
          return;
        }
        onSubmit({
          vehicleId: readFormString(formData, "vehicleId"),
          type: readFormString(formData, "type") as MaintenanceType,
          currentKm,
          limitKm,
          scheduledDate: readFormString(formData, "scheduledDate"),
          status: readFormString(formData, "status") as MaintenanceStatus,
          estimatedCost,
          workshop: readFormString(formData, "workshop"),
          notes: readFormString(formData, "notes") || undefined,
        });
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Unidad">
          <Select name="vehicleId" defaultValue={defaultRecord.vehicleId} required>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>{vehicle.code} · {vehicle.brand} {vehicle.model}</option>
            ))}
          </Select>
        </FormField>
        <FormField label="Tipo de servicio">
          <Select name="type" defaultValue={defaultRecord.type}>
            {MAINTENANCE_TYPES.map((type) => <option key={type} value={type}>{MAINTENANCE_TYPE_LABELS[type]}</option>)}
          </Select>
        </FormField>
        <FormField label="Estado">
          <Select name="status" defaultValue={defaultRecord.status}>
            {MAINTENANCE_STATUSES.map((status) => <option key={status} value={status}>{MAINTENANCE_STATUS_LABELS[status]}</option>)}
          </Select>
        </FormField>
        <FormField label="Fecha programada"><Input name="scheduledDate" type="date" defaultValue={defaultRecord.scheduledDate} required /></FormField>
        <FormField label="Km actual"><Input name="currentKm" type="number" min={0} defaultValue={defaultRecord.currentKm} required /></FormField>
        <FormField label="Km límite"><Input name="limitKm" type="number" min={1} defaultValue={defaultRecord.limitKm} required /></FormField>
        <FormField label="Costo estimado"><Input name="estimatedCost" type="number" min={0} step={100} defaultValue={defaultRecord.estimatedCost} required /></FormField>
        <FormField label="Taller"><Input name="workshop" defaultValue={defaultRecord.workshop} required /></FormField>
        <div className="sm:col-span-2">
          <FormField label="Observaciones"><Textarea name="notes" defaultValue={defaultRecord.notes ?? ""} /></FormField>
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

function MaintenanceMobileCard({
  record,
  vehicle,
  canUpdate,
  canDelete,
  onComplete,
  onEdit,
  onDelete,
}: {
  record: MaintenanceRecord;
  vehicle: string;
  canUpdate: boolean;
  canDelete: boolean;
  onComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold">{vehicle} · {MAINTENANCE_TYPE_LABELS[record.type]}</p>
          <p className="text-xs text-muted-foreground">{record.workshop} · {formatDate(record.scheduledDate)}</p>
        </div>
        <MaintenanceStatusBadge status={record.status} />
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <Info label="Km" value={`${formatNumber(record.currentKm)} / ${formatNumber(record.limitKm)}`} />
        <Info label="Costo" value={formatMXN(record.estimatedCost)} />
      </div>
      <div className="flex flex-wrap justify-end gap-1.5">
        {record.status !== "completado" && (
          <Button variant="ghost" size="sm" disabled={!canUpdate} onClick={onComplete}>
            <CheckCircle2 /> Completar
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
