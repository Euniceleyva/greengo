"use client";

import Link from "next/link";
import {
  CalendarClock,
  PlayCircle,
  CheckCircle2,
  AlertTriangle,
  Car,
  Route as RouteIcon,
  Fuel,
  Bell,
  Gauge,
  MapPinned,
} from "lucide-react";
import { useDemoStore } from "@/stores/demo-store";
import { useHydrated } from "@/lib/hooks";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/misc";
import { SimpleBarChart } from "@/components/charts/charts";
import { MapView, type MapMarker } from "@/components/maps/map-view";
import { TripStatusBadge, AlertPriorityBadge } from "@/components/shared/badges";
import { ALERT_TYPE_LABELS, VEHICLE_STATUS_COLOR } from "@/constants";
import { formatMXN, formatNumber } from "@/lib/utils";
import { formatDate, timeAgo } from "@/lib/format";
import { isToday, vehicleLabel } from "@/lib/lookups";

export default function DashboardPage() {
  const hydrated = useHydrated();
  const { trips, vehicles, alerts } = useDemoStore();

  if (!hydrated) return <DashboardSkeleton />;

  const todayTrips = trips.filter(isToday);
  const scheduledToday = todayTrips.length;
  const inProgress = trips.filter((t) =>
    ["en_camino", "en_espera", "pasajero_abordado", "en_curso"].includes(t.status),
  ).length;
  const completedToday = todayTrips.filter((t) => t.status === "completado").length;
  const withIncidents = trips.filter((t) => t.status === "con_incidencia").length;

  const available = vehicles.filter((v) => v.status === "disponible").length;
  const onRoute = vehicles.filter((v) => v.status === "en_ruta").length;
  const inMaintenance = vehicles.filter((v) => v.status === "mantenimiento").length;

  const kmToday = todayTrips.reduce((sum, t) => sum + (t.realKm ?? 0), 0);
  const kmOffRoute = trips.reduce((sum, t) => sum + t.offRouteKm, 0);
  const fuelEstimate = todayTrips.reduce((sum, t) => sum + (t.realKm ?? t.plannedKm) / 8, 0);
  const pendingAlerts = alerts.filter((a) => a.status === "pendiente").length;

  // Km recorridos por día de la semana (mock derivado)
  const weekData = [
    { label: "Lun", value: 640 },
    { label: "Mar", value: 720 },
    { label: "Mié", value: 580 },
    { label: "Jue", value: 810 },
    { label: "Vie", value: 690 },
    { label: "Sáb", value: 920 },
    { label: "Dom", value: Math.round(kmToday) || 430 },
  ];

  // Consumo estimado por unidad (litros aprox) para las 6 primeras
  const consumptionData = vehicles.slice(0, 6).map((v) => ({
    label: v.code,
    value: Math.round((100 - v.fuelLevel) * 0.6),
  }));

  const upcoming = trips
    .filter((t) => ["pendiente", "asignado"].includes(t.status))
    .slice(0, 5);
  const recentAlerts = alerts
    .filter((a) => a.status === "pendiente")
    .slice(0, 5);

  const mapMarkers: MapMarker[] = vehicles.map((v) => ({
    id: v.id,
    position: v.lastLocation,
    color: VEHICLE_STATUS_COLOR[v.status],
    title: v.code,
    popup: (
      <div className="text-xs">
        <p className="font-semibold">{v.code} · {v.plates}</p>
        <p>{v.lastLocationName}</p>
      </div>
    ),
  }));

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Resumen operativo del día · Cancún"
        actions={
          <Link
            href="/admin/monitoring"
            className="inline-flex h-8 items-center gap-2 rounded-md border border-input bg-card px-3 text-xs font-medium hover:bg-secondary"
          >
            <MapPinned className="h-4 w-4" /> Ver monitoreo
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <KpiCard label="Programados hoy" value={scheduledToday} icon={CalendarClock} tone="primary" />
        <KpiCard label="En curso" value={inProgress} icon={PlayCircle} tone="primary" />
        <KpiCard label="Completados hoy" value={completedToday} icon={CheckCircle2} tone="success" />
        <KpiCard label="Con incidencias" value={withIncidents} icon={AlertTriangle} tone="danger" />
        <KpiCard label="Disponibles" value={available} icon={Car} tone="success" />
        <KpiCard label="En ruta" value={onRoute} icon={RouteIcon} tone="primary" />
        <KpiCard label="En mantenimiento" value={inMaintenance} icon={Car} tone="neutral" />
        <KpiCard label="Alertas pendientes" value={pendingAlerts} icon={Bell} tone="warning" />
        <KpiCard label="Km recorridos hoy" value={formatNumber(kmToday)} icon={Gauge} tone="primary" hint="Suma de km reales" />
        <KpiCard label="Km fuera de servicio" value={formatNumber(kmOffRoute, 1)} icon={RouteIcon} tone="warning" hint="Desvíos detectados" />
        <KpiCard label="Combustible estimado" value={`${formatNumber(fuelEstimate)} L`} icon={Fuel} tone="neutral" hint="Consumo del día" />
        <KpiCard label="Ingreso estimado hoy" value={formatMXN(todayTrips.reduce((s, t) => s + t.amount, 0))} icon={CheckCircle2} tone="success" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Kilómetros recorridos (semana)</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={weekData} unit="km" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Consumo estimado por unidad</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={consumptionData} color="#059669" unit="L" />
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Próximos servicios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcoming.map((t) => (
              <Link
                key={t.id}
                href={`/admin/trips/${t.id}`}
                className="block rounded-md border border-border p-3 transition-colors hover:bg-secondary"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{t.folio}</span>
                  <TripStatusBadge status={t.status} />
                </div>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {t.origin} → {t.destination}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatDate(t.date)} · {t.time} h · {vehicleLabel(vehicles, t.vehicleId)}
                </p>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Alertas recientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentAlerts.map((a) => (
              <Link
                key={a.id}
                href="/admin/alerts"
                className="block rounded-md border border-border p-3 transition-colors hover:bg-secondary"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium">{ALERT_TYPE_LABELS[a.type]}</span>
                  <AlertPriorityBadge priority={a.priority} />
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">{timeAgo(a.createdAt)}</p>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Unidades en el mapa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 overflow-hidden rounded-lg">
              <MapView markers={mapMarkers} zoom={10} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div>
      <Skeleton className="mb-6 h-8 w-48" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}
