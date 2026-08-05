"use client";

import { useState, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Phone, Star, Route as RouteIcon, AlertTriangle, ShieldAlert, Trash2 } from "lucide-react";
import { useDemoStore } from "@/stores/demo-store";
import { useHydrated } from "@/lib/hooks";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input, Label, Select } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/misc";
import { EmptyState } from "@/components/shared/states";
import { Avatar } from "@/components/shared/avatar";
import { DriverStatusBadge, TripStatusBadge } from "@/components/shared/badges";
import { KpiCard } from "@/components/shared/kpi-card";
import { formatNumber } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { vehicleLabel } from "@/lib/lookups";
import { DRIVER_STATUS_LABELS } from "@/constants";
import { toast } from "@/components/ui/toast";
import type { DriverStatus } from "@/types";
import { useSessionStore } from "@/stores/session-store";
import { MOCK_USERS } from "@/mocks/users";
import { hasAdminPermission, permissionLabel } from "@/lib/admin-permissions";
import { hasDuplicateDriverLicense, isFiniteNumber, normalizeCode } from "@/lib/admin-validation";

const DRIVER_STATUSES = Object.keys(DRIVER_STATUS_LABELS) as DriverStatus[];

export default function DriverDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const hydrated = useHydrated();
  const sessionUser = useSessionStore((s) => s.currentUser);
  const { drivers, vehicles, trips, incidents, updateDriver, deleteDriver } = useDemoStore();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!hydrated) return <Skeleton className="h-96 w-full" />;

  const user = sessionUser ?? MOCK_USERS[0];
  const canUpdate = hasAdminPermission(user.role, "admin:update");
  const canDelete = hasAdminPermission(user.role, "admin:delete");
  const driver = drivers.find((d) => d.id === params.id);
  if (!driver) {
    return (
      <EmptyState
        title="Conductor no encontrado"
        action={<Button onClick={() => router.push("/admin/drivers")}>Volver</Button>}
      />
    );
  }

  const driverTrips = trips.filter((t) => t.driverId === driver.id);
  const driverIncidents = incidents.filter((i) => i.driverId === driver.id);
  const assignedVehicles = vehicles.filter((vehicle) => vehicle.assignedDriverId === driver.id);
  const deleteImpact = {
    trips: driverTrips.length,
    vehicles: assignedVehicles.length,
  };

  return (
    <div>
      <PageHeader
        title="Perfil del conductor"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Conductores", href: "/admin/drivers" },
          { label: driver.name },
        ]}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => router.push("/admin/drivers")}>
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
          <CardContent className="p-5">
            <div className="flex flex-col items-center text-center">
              <Avatar name={driver.name} size="lg" />
              <h2 className="mt-3 text-lg font-bold">{driver.name}</h2>
              <div className="mt-1">
                <DriverStatusBadge status={driver.status} />
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <Row icon={Phone} label="Teléfono" value={driver.phone} />
              <Row label="Licencia" value={driver.licenseNumber} />
              <Row label="Vigencia licencia" value={formatDate(driver.licenseExpiresOn, "dd MMM yyyy")} />
              <Row label="Unidad asignada" value={vehicleLabel(vehicles, driver.assignedVehicleId)} />
              <Row icon={ShieldAlert} label="Contacto emergencia" value={`${driver.emergencyContact} · ${driver.emergencyPhone}`} />
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <KpiCard label="Viajes completados" value={driver.completedTrips} icon={RouteIcon} tone="primary" />
            <KpiCard label="Calificación" value={driver.rating} icon={Star} tone="success" />
            <KpiCard label="Km conducidos" value={formatNumber(driver.drivenKm)} icon={RouteIcon} tone="neutral" />
            <KpiCard label="Incidencias" value={driver.incidents} icon={AlertTriangle} tone="warning" />
          </div>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Historial de servicios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {driverTrips.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin servicios registrados.</p>
              ) : (
                driverTrips.slice(0, 8).map((t) => (
                  <Link
                    key={t.id}
                    href={`/admin/trips/${t.id}`}
                    className="flex items-center justify-between gap-2 rounded-md border border-border p-2 text-sm hover:bg-secondary"
                  >
                    <span>
                      <span className="font-medium">{t.folio}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {t.origin} → {t.destination}
                      </span>
                    </span>
                    <TripStatusBadge status={t.status} />
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          {driverIncidents.length > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Incidencias reportadas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {driverIncidents.map((i) => (
                  <div key={i.id} className="rounded-md border border-border p-2 text-sm">
                    <p className="text-xs text-muted-foreground">{formatDate(i.createdAt, "dd MMM yyyy")}</p>
                    <p>{i.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        side
        title="Editar conductor"
        description="Actualiza los datos operativos del conductor en el DEMO."
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
            const licenseNumber = normalizeCode(readFormString(formData, "licenseNumber"));
            const completedTrips = Number(formData.get("completedTrips") ?? driver.completedTrips);
            const rating = Number(formData.get("rating") ?? driver.rating);
            const incidentsCount = Number(formData.get("incidents") ?? driver.incidents);
            const drivenKm = Number(formData.get("drivenKm") ?? driver.drivenKm);

            if (!readFormString(formData, "name") || !readFormString(formData, "phone") || !licenseNumber) {
              toast.warning("Completa nombre, teléfono y licencia.");
              return;
            }

            if (hasDuplicateDriverLicense(drivers, licenseNumber, driver.id)) {
              toast.warning("Ya existe otro conductor con esa licencia.");
              return;
            }

            if (
              ![completedTrips, rating, incidentsCount, drivenKm].every(isFiniteNumber) ||
              completedTrips < 0 ||
              rating < 1 ||
              rating > 5 ||
              incidentsCount < 0 ||
              drivenKm < 0
            ) {
              toast.warning("Revisa viajes, calificación, incidentes y kilómetros.");
              return;
            }

            updateDriver(driver.id, {
              name: readFormString(formData, "name"),
              phone: readFormString(formData, "phone"),
              licenseNumber,
              licenseExpiresOn: readFormString(formData, "licenseExpiresOn"),
              status: readFormString(formData, "status") as DriverStatus,
              assignedVehicleId: readFormString(formData, "assignedVehicleId") || null,
              completedTrips,
              rating,
              incidents: incidentsCount,
              drivenKm,
              emergencyContact: readFormString(formData, "emergencyContact"),
              emergencyPhone: readFormString(formData, "emergencyPhone"),
            });
            setEditOpen(false);
            toast.success("Conductor actualizado en el DEMO.");
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nombre completo"><Input name="name" defaultValue={driver.name} required /></Field>
            <Field label="Teléfono"><Input name="phone" defaultValue={driver.phone} required /></Field>
            <Field label="Licencia"><Input name="licenseNumber" defaultValue={driver.licenseNumber} required /></Field>
            <Field label="Vigencia"><Input name="licenseExpiresOn" type="date" defaultValue={driver.licenseExpiresOn} required /></Field>
            <Field label="Estado">
              <Select name="status" defaultValue={driver.status}>
                {DRIVER_STATUSES.map((status) => <option key={status} value={status}>{DRIVER_STATUS_LABELS[status]}</option>)}
              </Select>
            </Field>
            <Field label="Unidad asignada">
              <Select name="assignedVehicleId" defaultValue={driver.assignedVehicleId ?? ""}>
                <option value="">Sin asignar</option>
                {vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.code} · {vehicle.brand} {vehicle.model}</option>)}
              </Select>
            </Field>
            <Field label="Viajes"><Input name="completedTrips" type="number" min={0} defaultValue={driver.completedTrips} /></Field>
            <Field label="Calificación"><Input name="rating" type="number" min={1} max={5} step={0.1} defaultValue={driver.rating} /></Field>
            <Field label="Incidentes"><Input name="incidents" type="number" min={0} defaultValue={driver.incidents} /></Field>
            <Field label="Km conducidos"><Input name="drivenKm" type="number" min={0} defaultValue={driver.drivenKm} /></Field>
            <Field label="Contacto emergencia"><Input name="emergencyContact" defaultValue={driver.emergencyContact} /></Field>
            <Field label="Teléfono emergencia"><Input name="emergencyPhone" defaultValue={driver.emergencyPhone} /></Field>
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
        title="Eliminar conductor"
        description="Se quitará del DEMO y se limpiarán sus asignaciones relacionadas. Esta acción solo afecta datos locales mock."
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-destructive/20 bg-destructive-soft p-3 text-sm text-destructive">
            Impacto: {deleteImpact.trips} servicio(s) quedarán sin conductor y {deleteImpact.vehicles} unidad(es) quedarán sin asignación.
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
                deleteDriver(driver.id);
                toast.success("Conductor eliminado del DEMO.");
                router.push("/admin/drivers");
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

function Field({ label, children }: { label: string; children: ReactNode }) {
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

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon?: typeof Phone;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="flex items-center gap-1.5 text-muted-foreground">
        {Icon && <Icon className="h-3.5 w-3.5" />} {label}
      </span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
