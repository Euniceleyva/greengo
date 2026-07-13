"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Phone, Star, Route as RouteIcon, AlertTriangle, ShieldAlert } from "lucide-react";
import { useDemoStore } from "@/stores/demo-store";
import { useHydrated } from "@/lib/hooks";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/misc";
import { EmptyState } from "@/components/shared/states";
import { Avatar } from "@/components/shared/avatar";
import { DriverStatusBadge, TripStatusBadge } from "@/components/shared/badges";
import { KpiCard } from "@/components/shared/kpi-card";
import { formatNumber } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { vehicleLabel } from "@/lib/lookups";

export default function DriverDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const hydrated = useHydrated();
  const { drivers, vehicles, trips, incidents } = useDemoStore();

  if (!hydrated) return <Skeleton className="h-96 w-full" />;

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
          <Button variant="outline" size="sm" onClick={() => router.push("/admin/drivers")}>
            <ArrowLeft /> Volver
          </Button>
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
    </div>
  );
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
