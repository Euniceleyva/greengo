"use client";

import { useRouter } from "next/navigation";
import { Plus, Star } from "lucide-react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useDemoStore, type NewDriverInput } from "@/stores/demo-store";
import { useHydrated } from "@/lib/hooks";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column, type FilterConfig } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input, Label, Select } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/misc";
import { DriverStatusBadge } from "@/components/shared/badges";
import { DRIVER_STATUS_LABELS } from "@/constants";
import type { Driver, DriverStatus } from "@/types";
import { formatNumber } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { vehicleLabel } from "@/lib/lookups";
import { Avatar } from "@/components/shared/avatar";
import { toast } from "@/components/ui/toast";
import { hasDuplicateDriverLicense, isFiniteNumber, normalizeCode } from "@/lib/admin-validation";
import { useSessionStore } from "@/stores/session-store";
import { MOCK_USERS } from "@/mocks/users";
import { hasAdminPermission, permissionLabel } from "@/lib/admin-permissions";

const DRIVER_STATUSES = Object.keys(DRIVER_STATUS_LABELS) as DriverStatus[];

export default function DriversPage() {
  const hydrated = useHydrated();
  const router = useRouter();
  const sessionUser = useSessionStore((s) => s.currentUser);
  const { drivers, vehicles, createDriver } = useDemoStore();
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (window.location.search.includes("new=1")) {
      setCreateOpen(true);
    }
  }, []);

  if (!hydrated) return <Skeleton className="h-96 w-full" />;

  const user = sessionUser ?? MOCK_USERS[0];
  const canCreate = hasAdminPermission(user.role, "admin:create");
  const handleCreateDriver = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canCreate) {
      toast.warning(`Tu rol no puede ${permissionLabel("admin:create")}.`);
      return;
    }
    const formData = new FormData(event.currentTarget);
    const name = readFormString(formData, "name");
    const phone = readFormString(formData, "phone");
    const licenseNumber = normalizeCode(readFormString(formData, "licenseNumber"));
    const licenseExpiresOn = readFormString(formData, "licenseExpiresOn");
    const emergencyContact = readFormString(formData, "emergencyContact");
    const emergencyPhone = readFormString(formData, "emergencyPhone");
    const completedTrips = Number(formData.get("completedTrips") ?? 0);
    const rating = Number(formData.get("rating") ?? 5);
    const incidents = Number(formData.get("incidents") ?? 0);
    const drivenKm = Number(formData.get("drivenKm") ?? 0);

    if (!name || !phone || !licenseNumber || !licenseExpiresOn) {
      toast.warning("Completa nombre, teléfono, licencia y vigencia.");
      return;
    }

    if (hasDuplicateDriverLicense(drivers, licenseNumber)) {
      toast.warning("Ya existe un conductor con esa licencia.");
      return;
    }

    if (
      ![completedTrips, rating, incidents, drivenKm].every(isFiniteNumber) ||
      completedTrips < 0 ||
      incidents < 0 ||
      drivenKm < 0 ||
      rating < 1 ||
      rating > 5
    ) {
      toast.warning("Revisa viajes, calificación, incidentes y kilómetros.");
      return;
    }

    const driver: NewDriverInput = {
      name,
      phone,
      licenseNumber,
      licenseExpiresOn,
      status: readFormString(formData, "status") as DriverStatus,
      assignedVehicleId: readFormString(formData, "assignedVehicleId") || null,
      completedTrips,
      rating,
      incidents,
      drivenKm,
      emergencyContact: emergencyContact || "Por definir",
      emergencyPhone: emergencyPhone || "Por definir",
    };

    const created = createDriver(driver);
    setCreateOpen(false);
    toast.success(`Conductor ${created.name} agregado al DEMO.`);
  };

  const filters: FilterConfig<Driver>[] = [
    {
      label: "Estado",
      options: (Object.keys(DRIVER_STATUS_LABELS) as DriverStatus[]).map((s) => ({
        value: s,
        label: DRIVER_STATUS_LABELS[s],
      })),
      predicate: (d, v) => d.status === v,
    },
  ];

  const columns: Column<Driver>[] = [
    {
      key: "name",
      header: "Conductor",
      render: (d) => (
        <div className="flex items-center gap-2">
          <Avatar name={d.name} />
          <span className="font-medium">{d.name}</span>
        </div>
      ),
    },
    { key: "phone", header: "Teléfono", render: (d) => <span className="text-xs">{d.phone}</span> },
    { key: "license", header: "Licencia", render: (d) => <span className="text-xs">{d.licenseNumber}</span> },
    { key: "exp", header: "Vigencia", render: (d) => <span className="text-xs">{formatDate(d.licenseExpiresOn, "dd MMM yyyy")}</span> },
    { key: "vehicle", header: "Unidad", render: (d) => <span className="text-xs">{vehicleLabel(vehicles, d.assignedVehicleId)}</span> },
    { key: "trips", header: "Viajes", render: (d) => <span className="tabular-nums">{d.completedTrips}</span> },
    {
      key: "rating",
      header: "Calificación",
      render: (d) => (
        <span className="inline-flex items-center gap-1 tabular-nums">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {d.rating}
        </span>
      ),
    },
    { key: "km", header: "Km conducidos", render: (d) => <span className="tabular-nums">{formatNumber(d.drivenKm)}</span> },
    { key: "status", header: "Estado", render: (d) => <DriverStatusBadge status={d.status} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Conductores"
        description="Personal de traslados, licencias y desempeño."
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Conductores" }]}
        actions={
          <Button
            size="sm"
            disabled={!canCreate}
            title={!canCreate ? `Tu rol no puede ${permissionLabel("admin:create")}.` : undefined}
            onClick={() => setCreateOpen(true)}
          >
            <Plus /> Agregar conductor
          </Button>
        }
      />
      <DataTable
        columns={columns}
        rows={drivers}
        getRowId={(d) => d.id}
        searchPlaceholder="Buscar por nombre, teléfono o licencia…"
        searchAccessor={(d) => `${d.name} ${d.phone} ${d.licenseNumber}`}
        filters={filters}
        onRowClick={(d) => router.push(`/admin/drivers/${d.id}`)}
        renderMobileCard={(d) => (
          <DriverMobileCard
            driver={d}
            vehicle={vehicleLabel(vehicles, d.assignedVehicleId)}
          />
        )}
        emptyTitle="Sin conductores"
        emptyDescription="Da de alta un conductor para asignarlo a unidades y servicios."
        emptyAction={
          <Button size="sm" disabled={!canCreate} onClick={() => setCreateOpen(true)}>
            <Plus /> Agregar conductor
          </Button>
        }
      />

      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        side
        title="Agregar conductor"
        description="Registra un conductor mock para asignaciones, desempeño y seguimiento operativo."
      >
        <form className="space-y-5" onSubmit={handleCreateDriver}>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Nombre completo">
              <Input name="name" placeholder="Carlos Mendoza" required />
            </FormField>
            <FormField label="Teléfono">
              <Input name="phone" placeholder="998-000-0000" required />
            </FormField>
            <FormField label="Licencia">
              <Input name="licenseNumber" placeholder="LIC-QR-00000" required />
            </FormField>
            <FormField label="Vigencia de licencia">
              <Input name="licenseExpiresOn" type="date" defaultValue="2027-12-31" required />
            </FormField>
            <FormField label="Estado">
              <Select name="status" defaultValue="activo">
                {DRIVER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {DRIVER_STATUS_LABELS[status]}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Unidad asignada">
              <Select name="assignedVehicleId" defaultValue="">
                <option value="">Sin asignar</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.code} · {vehicle.brand} {vehicle.model}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Viajes completados">
              <Input name="completedTrips" type="number" min={0} defaultValue={0} />
            </FormField>
            <FormField label="Calificación">
              <Input name="rating" type="number" min={1} max={5} step={0.1} defaultValue={5} />
            </FormField>
            <FormField label="Incidentes">
              <Input name="incidents" type="number" min={0} defaultValue={0} />
            </FormField>
            <FormField label="Km conducidos">
              <Input name="drivenKm" type="number" min={0} defaultValue={0} />
            </FormField>
            <FormField label="Contacto emergencia">
              <Input name="emergencyContact" placeholder="Nombre del contacto" />
            </FormField>
            <FormField label="Teléfono emergencia">
              <Input name="emergencyPhone" placeholder="998-000-0000" />
            </FormField>
          </div>
          <div className="rounded-lg border border-border bg-secondary/50 p-3 text-sm text-muted-foreground">
            Al guardar se agrega el conductor al DEMO y queda disponible para asignarlo a servicios y unidades.
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              <Plus /> Guardar conductor
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
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

function DriverMobileCard({ driver, vehicle }: { driver: Driver; vehicle: string }) {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Avatar name={driver.name} />
          <div className="min-w-0">
            <p className="truncate font-semibold">{driver.name}</p>
            <p className="text-xs text-muted-foreground">{driver.phone}</p>
          </div>
        </div>
        <DriverStatusBadge status={driver.status} />
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <Info label="Unidad" value={vehicle} />
        <Info label="Licencia" value={driver.licenseNumber} />
        <Info label="Viajes" value={String(driver.completedTrips)} />
        <Info label="Calificación" value={String(driver.rating)} />
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
