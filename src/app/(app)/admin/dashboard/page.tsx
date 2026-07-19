"use client";

import Link from "next/link";
import {
  CalendarClock,
  PlayCircle,
  Car,
  Bell,
  Route as RouteIcon,
  Fuel,
  Gauge,
  MapPinned,
  CheckCircle2,
  Wrench,
  Plus,
  UserCog,
} from "lucide-react";
import { useDemoStore } from "@/stores/demo-store";
import { useHydrated } from "@/lib/hooks";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  const criticalAlerts = alerts.filter((a) => a.status === "pendiente" && a.priority === "alta").length;

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
            className="inline-flex h-11 items-center gap-2 rounded-md border border-input bg-card px-3 text-sm font-medium transition-colors hover:bg-secondary"
          >
            <MapPinned className="h-4 w-4" /> Ver monitoreo
          </Link>
        }
      />

      {/* Primera jerarquía: lo que hay que saber en los primeros segundos */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Programados hoy" value={scheduledToday} icon={CalendarClock} tone="primary" hint="Servicios de hoy" />
        <KpiCard label="En curso" value={inProgress} icon={PlayCircle} tone="info" hint="Traslados activos" />
        <KpiCard label="Unidades disponibles" value={available} icon={Car} tone="success" hint={`${onRoute} en ruta`} />
        <KpiCard
          label="Alertas por atender"
          value={pendingAlerts}
          icon={Bell}
          tone={criticalAlerts > 0 ? "danger" : pendingAlerts > 0 ? "warning" : "success"}
          hint={criticalAlerts > 0 ? `${criticalAlerts} crítica(s)` : "Sin críticas"}
        />
      </div>

      {/* Acciones rápidas */}
      <div className="mt-5">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Acciones rápidas</h2>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
          <QuickAction href="/admin/trips" icon={Plus} label="Crear servicio" tone="primary" />
          <QuickAction href="/admin/drivers" icon={UserCog} label="Asignar conductor" tone="info" />
          <QuickAction href="/admin/monitoring" icon={MapPinned} label="Ver monitoreo" tone="info" />
          <QuickAction href="/admin/fuel" icon={Fuel} label="Registrar combustible" tone="warning" />
          <QuickAction href="/admin/alerts" icon={Bell} label="Revisar alertas" tone="danger" />
        </div>
      </div>

      {/* Segunda jerarquía: indicadores de apoyo, en franja compacta */}
      <div className="mt-5">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Resumen secundario</h2>
        <div className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          <div className="w-36 shrink-0">
            <KpiCard size="compact" label="Completados hoy" value={completedToday} icon={CheckCircle2} tone="success" />
          </div>
          <div className="w-36 shrink-0">
            <KpiCard size="compact" label="Incidencias" value={withIncidents} icon={RouteIcon} tone="danger" />
          </div>
          <div className="w-36 shrink-0">
            <KpiCard size="compact" label="Km hoy" value={formatNumber(kmToday)} icon={Gauge} tone="info" />
          </div>
          <div className="w-36 shrink-0">
            <KpiCard size="compact" label="Km fuera ruta" value={formatNumber(kmOffRoute, 1)} icon={RouteIcon} tone="warning" />
          </div>
          <div className="w-36 shrink-0">
            <KpiCard size="compact" label="Combustible" value={`${formatNumber(fuelEstimate)} L`} icon={Fuel} tone="neutral" />
          </div>
          <div className="w-36 shrink-0">
            <KpiCard size="compact" label="Mantenimiento" value={inMaintenance} icon={Wrench} tone="neutral" />
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Ingreso estimado hoy: <span className="font-semibold text-foreground">{formatMXN(todayTrips.reduce((s, t) => s + t.amount, 0))}</span>
        </p>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Kilómetros recorridos por día</CardTitle>
            <CardDescription>Suma de kilómetros reales registrados · unidad: km</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={weekData} unit="km" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Consumo estimado por unidad</CardTitle>
            <CardDescription>Aproximación según nivel de combustible actual · unidad: litros</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={consumptionData} color="#00AFEE" unit="L" />
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Próximos servicios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcoming.length === 0 && (
              <p className="rounded-md bg-muted px-3 py-6 text-center text-xs text-muted-foreground">
                No hay servicios próximos.
              </p>
            )}
            {upcoming.map((t) => (
              <Link
                key={t.id}
                href={`/admin/trips/${t.id}`}
                className="block rounded-lg border border-border p-3 transition-colors hover:border-primary/40 hover:bg-primary-soft/60"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">{t.folio}</span>
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
            {recentAlerts.length === 0 && (
              <p className="rounded-md bg-muted px-3 py-6 text-center text-xs text-muted-foreground">
                Sin alertas pendientes. Todo en orden.
              </p>
            )}
            {recentAlerts.map((a) => (
              <Link
                key={a.id}
                href="/admin/alerts"
                className={cnAlert(a.priority)}
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

function cnAlert(priority: "alta" | "media" | "baja") {
  const base = "block rounded-lg border p-3 transition-colors";
  if (priority === "alta") return `${base} border-destructive/30 bg-destructive-soft hover:border-destructive/50`;
  if (priority === "media") return `${base} border-warning/30 bg-warning-soft hover:border-warning/50`;
  return `${base} border-border hover:bg-secondary`;
}

function QuickAction({
  href,
  icon: Icon,
  label,
  tone,
}: {
  href: string;
  icon: typeof Plus;
  label: string;
  tone: "primary" | "info" | "warning" | "danger";
}) {
  const toneClass = {
    primary: "bg-primary-soft text-primary",
    info: "bg-info-soft text-info",
    warning: "bg-warning-soft text-warning",
    danger: "bg-destructive-soft text-destructive",
  }[tone];
  return (
    <Link
      href={href}
      className="flex min-h-[44px] flex-col items-center gap-2 rounded-xl border border-border bg-card p-3 text-center shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${toneClass}`}>
        <Icon className="h-4 w-4" />
      </span>
      <span className="text-xs font-medium leading-tight text-foreground">{label}</span>
    </Link>
  );
}

function DashboardSkeleton() {
  return (
    <div>
      <Skeleton className="mb-6 h-8 w-48" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}
