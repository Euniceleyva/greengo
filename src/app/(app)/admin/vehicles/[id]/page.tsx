"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, Gauge, Car } from "lucide-react";
import { useDemoStore } from "@/stores/demo-store";
import { useHydrated } from "@/lib/hooks";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { VEHICLE_TYPE_LABELS, ALERT_TYPE_LABELS, MAINTENANCE_TYPE_LABELS } from "@/constants";
import { formatNumber, formatMXN } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { driverName } from "@/lib/lookups";

export default function VehicleDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const hydrated = useHydrated();
  const { vehicles, drivers, trips, fuel, maintenance, alerts } = useDemoStore();

  if (!hydrated) return <Skeleton className="h-96 w-full" />;

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
          <Button variant="outline" size="sm" onClick={() => router.push("/admin/vehicles")}>
            <ArrowLeft /> Volver
          </Button>
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
