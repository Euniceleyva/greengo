"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  BusFront,
  CalendarClock,
  Calculator,
  ClipboardList,
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
  Globe2,
  type LucideIcon,
} from "lucide-react";
import { useDemoStore } from "@/stores/demo-store";
import { useHydrated } from "@/lib/hooks";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/misc";
import { SimpleBarChart } from "@/components/charts/charts";
import { MapView, type MapMarker } from "@/components/maps/map-view";
import { TripStatusBadge, AlertPriorityBadge } from "@/components/shared/badges";
import {
  ALERT_TYPE_LABELS,
  FUEL_VALIDATION_LABELS,
  MAINTENANCE_TYPE_LABELS,
  VEHICLE_PAYMENT_CONCEPT_LABELS,
  VEHICLE_STATUS_COLOR,
  type BadgeTone,
} from "@/constants";
import { formatMXN, formatNumber } from "@/lib/utils";
import { formatDate, timeAgo } from "@/lib/format";
import { driverName, isToday, vehicleLabel } from "@/lib/lookups";
import type {
  AdminActivityEvent,
  Alert,
  Driver,
  FuelRecord,
  MaintenanceRecord,
  Trip,
  Vehicle,
  VehicleCompliancePayment,
} from "@/types";

const DASHBOARD_TODAY = "2026-08-05";
const CRITICAL_SOON_DAYS = 30;
type CriticalFilter = "todo" | "operacion" | "flota" | "pagos";

const CRITICAL_FILTERS: Array<{ id: CriticalFilter; label: string }> = [
  { id: "todo", label: "Todo" },
  { id: "operacion", label: "Operación" },
  { id: "flota", label: "Flota" },
  { id: "pagos", label: "Pagos" },
];

export default function DashboardPage() {
  const hydrated = useHydrated();
  const {
    trips,
    vehicles,
    drivers,
    alerts,
    adminActivityLog,
    vehiclePayments,
    maintenance,
    fuel,
    markAlertReviewed,
    updateVehiclePayment,
    updateMaintenance,
    updateFuelRecord,
  } = useDemoStore();
  const [criticalFilter, setCriticalFilter] = useState<CriticalFilter>("todo");

  if (!hydrated) return <DashboardSkeleton />;

  const todayTrips = trips.filter(isToday);
  const scheduledToday = todayTrips.length;
  const inProgress = trips.filter((t) =>
    ["en_camino", "en_espera", "pasajero_abordado", "en_curso"].includes(t.status),
  ).length;
  const completedToday = todayTrips.filter((t) => t.status === "completado").length;
  const withIncidents = trips.filter((t) => t.status === "con_incidencia").length;
  const webBookings = trips.filter((t) => t.bookingSource === "web" && ["pendiente", "asignado"].includes(t.status)).length;

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
  const recentActivity = [...(adminActivityLog ?? [])]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);
  const criticalItems = buildCriticalItems({
    trips,
    vehicles,
    drivers,
    alerts,
    vehiclePayments,
    maintenance,
    fuel,
  });
  const visibleCriticalItems = criticalFilter === "todo"
    ? criticalItems
    : criticalItems.filter((item) => item.category === criticalFilter);
  const todayTasks = buildTodayTasks({
    trips,
    vehicles,
    drivers,
    alerts,
    vehiclePayments,
    maintenance,
    fuel,
  });

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
        <KpiCard label="Reservas web" value={webBookings} icon={Globe2} tone="info" hint="Pendientes/asignadas" />
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
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 xl:grid-cols-8">
          <QuickAction href="/admin/trips?new=1" icon={Plus} label="Crear servicio" tone="primary" />
          <QuickAction href="/admin/vehicles?new=1" icon={BusFront} label="Agregar vehículo" tone="info" />
          <QuickAction href="/admin/drivers?new=1" icon={UserCog} label="Agregar conductor" tone="info" />
          <QuickAction href="/admin/maintenance?new=1" icon={Wrench} label="Programar mantenimiento" tone="warning" />
          <QuickAction href="/admin/fuel?new=1" icon={Fuel} label="Registrar combustible" tone="warning" />
          <QuickAction href="/admin/accounting?new=entry" icon={Calculator} label="Registrar movimiento" tone="primary" />
          <QuickAction href="/admin/monitoring" icon={MapPinned} label="Ver monitoreo" tone="info" />
          <QuickAction href="/admin/alerts" icon={Bell} label="Revisar alertas" tone="danger" />
        </div>
      </div>

      <Card className="mt-5">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-primary" /> Pendientes de hoy
              </CardTitle>
              <CardDescription>Servicios, pagos y revisiones que conviene atender durante la jornada.</CardDescription>
            </div>
            <Badge tone={todayTasks.length > 0 ? "info" : "success"}>
              {todayTasks.length > 0 ? `${todayTasks.length} tarea(s)` : "Sin pendientes"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {todayTasks.length === 0 ? (
            <p className="rounded-md bg-muted px-3 py-6 text-center text-xs text-muted-foreground">
              No hay tareas operativas para hoy.
            </p>
          ) : (
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
              {todayTasks.slice(0, 8).map((item) => (
                <TodayTaskItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-5 border-warning/30">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" /> Pendientes críticos
              </CardTitle>
              <CardDescription>Temas que conviene revisar antes de iniciar o cerrar la operación del día.</CardDescription>
            </div>
            <Badge tone={criticalItems.length > 0 ? "warning" : "success"}>
              {criticalItems.length > 0 ? `${criticalItems.length} por revisar` : "Todo en orden"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-3 flex flex-wrap gap-2">
            {CRITICAL_FILTERS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setCriticalFilter(filter.id)}
                className={cnCriticalFilter(criticalFilter === filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>
          {visibleCriticalItems.length === 0 ? (
            <p className="rounded-md bg-muted px-3 py-6 text-center text-xs text-muted-foreground">
              No hay pendientes críticos para este filtro.
            </p>
          ) : (
            <div className="grid gap-2 lg:grid-cols-2 xl:grid-cols-3">
              {visibleCriticalItems.slice(0, 6).map((item) => (
                <CriticalItem
                  key={item.id}
                  item={item}
                  onResolve={() => {
                    if (!item.resolve) return;
                    if (item.resolve.type === "alert") markAlertReviewed(item.resolve.id);
                    if (item.resolve.type === "payment") updateVehiclePayment(item.resolve.id, { status: "programado" });
                    if (item.resolve.type === "maintenance") updateMaintenance(item.resolve.id, { status: "en_proceso" });
                    if (item.resolve.type === "fuel") updateFuelRecord(item.resolve.id, { validation: "validado", anomalyNote: undefined });
                  }}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-4 w-4" /> Actividad reciente
          </CardTitle>
          <CardDescription>Movimientos creados desde el panel administrativo del DEMO.</CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <p className="rounded-md bg-muted px-3 py-6 text-center text-xs text-muted-foreground">
              Aún no hay movimientos recientes. Usa una acción rápida para empezar.
            </p>
          ) : (
            <div className="grid gap-2 lg:grid-cols-5">
              {recentActivity.map((item) => (
                <ActivityItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Segunda jerarquía: indicadores de apoyo, en franja compacta */}
      <div className="mt-5">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Resumen secundario</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7">
          <div className="min-w-0">
            <KpiCard size="compact" label="Completados hoy" value={completedToday} icon={CheckCircle2} tone="success" />
          </div>
          <div className="min-w-0">
            <KpiCard size="compact" label="Incidencias" value={withIncidents} icon={RouteIcon} tone="danger" />
          </div>
          <div className="min-w-0">
            <KpiCard size="compact" label="Km hoy" value={formatNumber(kmToday)} icon={Gauge} tone="info" />
          </div>
          <div className="min-w-0">
            <KpiCard size="compact" label="Km fuera de ruta" value={formatNumber(kmOffRoute, 1)} icon={RouteIcon} tone="warning" />
          </div>
          <div className="min-w-0">
            <KpiCard size="compact" label="Combustible" value={`${formatNumber(fuelEstimate)} L`} icon={Fuel} tone="neutral" />
          </div>
          <div className="min-w-0">
            <KpiCard size="compact" label="Unidades libres" value={available} icon={Car} tone="success" hint={`${onRoute} en ruta`} />
          </div>
          <div className="min-w-0">
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
            <SimpleBarChart data={consumptionData} color="#94D9D9" unit="L" />
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
                  {formatDate(t.date)} · {t.time} h · {t.passengers} pax · {t.bags ?? t.passengers + 1} maletas
                </p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {vehicleLabel(vehicles, t.vehicleId)}
                </p>
                {t.bookingSource === "web" && <span className="mt-2 inline-flex rounded-full bg-info-soft px-2 py-1 text-[11px] font-semibold text-info">Reserva web</span>}
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

interface CriticalItemData {
  id: string;
  title: string;
  detail: string;
  href: string;
  badge: string;
  tone: BadgeTone;
  icon: LucideIcon;
  category: Exclude<CriticalFilter, "todo">;
  resolve?: {
    type: "alert" | "payment" | "maintenance" | "fuel";
    id: string;
    label: string;
  };
}

interface TodayTaskData {
  id: string;
  title: string;
  detail: string;
  href: string;
  badge: string;
  tone: BadgeTone;
  icon: LucideIcon;
}

function buildTodayTasks({
  trips,
  vehicles,
  drivers,
  alerts,
  vehiclePayments,
  maintenance,
  fuel,
}: {
  trips: Trip[];
  vehicles: Vehicle[];
  drivers: Driver[];
  alerts: Alert[];
  vehiclePayments: VehicleCompliancePayment[];
  maintenance: MaintenanceRecord[];
  fuel: FuelRecord[];
}): TodayTaskData[] {
  const serviceTasks = trips
    .filter((trip) => trip.date === DASHBOARD_TODAY && !["completado", "cancelado"].includes(trip.status))
    .sort((a, b) => a.time.localeCompare(b.time))
    .slice(0, 3)
    .map((trip) => ({
      id: `today-trip-${trip.id}`,
      title: `${trip.time} · ${trip.client}`,
      detail: `${trip.origin} → ${trip.destination} · ${driverName(drivers, trip.driverId)}`,
      href: `/admin/trips/${trip.id}`,
      badge: "Servicio",
      tone: "info" as const,
      icon: CalendarClock,
    }));

  const paymentTasks = vehiclePayments
    .filter((payment) => payment.status !== "pagado" && payment.dueDate <= DASHBOARD_TODAY)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 2)
    .map((payment) => ({
      id: `today-payment-${payment.id}`,
      title: VEHICLE_PAYMENT_CONCEPT_LABELS[payment.concept],
      detail: `${vehicleLabel(vehicles, payment.vehicleId)} · vence ${formatDate(payment.dueDate)} · ${formatMXN(payment.amount)}`,
      href: `/admin/vehicles/${payment.vehicleId}`,
      badge: payment.dueDate < DASHBOARD_TODAY ? "Vencido" : "Hoy",
      tone: payment.dueDate < DASHBOARD_TODAY ? ("danger" as const) : ("warning" as const),
      icon: ClipboardList,
    }));

  const maintenanceTasks = maintenance
    .filter((record) => record.status !== "completado" && record.scheduledDate <= DASHBOARD_TODAY)
    .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))
    .slice(0, 2)
    .map((record) => ({
      id: `today-maintenance-${record.id}`,
      title: MAINTENANCE_TYPE_LABELS[record.type],
      detail: `${vehicleLabel(vehicles, record.vehicleId)} · ${record.workshop} · ${formatMXN(record.estimatedCost)}`,
      href: "/admin/maintenance",
      badge: record.scheduledDate < DASHBOARD_TODAY ? "Atrasado" : "Hoy",
      tone: record.scheduledDate < DASHBOARD_TODAY ? ("danger" as const) : ("warning" as const),
      icon: Wrench,
    }));

  const alertTasks = alerts
    .filter((alert) => alert.status === "pendiente" && alert.createdAt.startsWith(DASHBOARD_TODAY))
    .slice(0, 1)
    .map((alert) => ({
      id: `today-alert-${alert.id}`,
      title: ALERT_TYPE_LABELS[alert.type],
      detail: alert.description,
      href: "/admin/alerts",
      badge: "Alerta",
      tone: alert.priority === "alta" ? ("danger" as const) : ("warning" as const),
      icon: Bell,
    }));

  const fuelTasks = fuel
    .filter((record) => record.validation === "por_revisar" && record.date.startsWith(DASHBOARD_TODAY))
    .slice(0, 1)
    .map((record) => ({
      id: `today-fuel-${record.id}`,
      title: "Carga por validar",
      detail: `${vehicleLabel(vehicles, record.vehicleId)} · ${record.station} · ${formatMXN(record.total)}`,
      href: "/admin/fuel",
      badge: "Combustible",
      tone: "warning" as const,
      icon: Fuel,
    }));

  return [...serviceTasks, ...paymentTasks, ...maintenanceTasks, ...alertTasks, ...fuelTasks];
}

function buildCriticalItems({
  trips,
  vehicles,
  drivers,
  alerts,
  vehiclePayments,
  maintenance,
  fuel,
}: {
  trips: Trip[];
  vehicles: Vehicle[];
  drivers: Driver[];
  alerts: Alert[];
  vehiclePayments: VehicleCompliancePayment[];
  maintenance: MaintenanceRecord[];
  fuel: FuelRecord[];
}): CriticalItemData[] {
  const highAlerts = alerts
    .filter((alert) => alert.status === "pendiente" && alert.priority === "alta")
    .slice(0, 2)
    .map((alert) => ({
      id: `alert-${alert.id}`,
      title: ALERT_TYPE_LABELS[alert.type],
      detail: alert.description,
      href: "/admin/alerts",
      badge: "Alerta alta",
      tone: "danger" as const,
      icon: Bell,
      category: "operacion" as const,
      resolve: { type: "alert" as const, id: alert.id, label: "Marcar revisada" },
    }));

  const unassignedTrips = trips
    .filter((trip) => ["pendiente", "asignado"].includes(trip.status) && (!trip.driverId || !trip.vehicleId))
    .slice(0, 2)
    .map((trip) => ({
      id: `trip-${trip.id}`,
      title: `Servicio ${trip.folio} sin asignación completa`,
      detail: `${trip.client} · ${trip.date} ${trip.time} · ${driverName(drivers, trip.driverId)} / ${vehicleLabel(vehicles, trip.vehicleId)}`,
      href: `/admin/trips/${trip.id}`,
      badge: "Asignar",
      tone: "warning" as const,
      icon: RouteIcon,
      category: "operacion" as const,
    }));

  const overduePayments = vehiclePayments
    .filter((payment) => payment.status !== "pagado" && (payment.status === "vencido" || payment.dueDate < DASHBOARD_TODAY))
    .slice(0, 2)
    .map((payment) => ({
      id: `payment-${payment.id}`,
      title: `${VEHICLE_PAYMENT_CONCEPT_LABELS[payment.concept]} vencida`,
      detail: `${vehicleLabel(vehicles, payment.vehicleId)} · ${formatDate(payment.dueDate)} · ${formatMXN(payment.amount)}`,
      href: `/admin/vehicles/${payment.vehicleId}`,
      badge: "Pago",
      tone: "danger" as const,
      icon: ClipboardList,
      category: "pagos" as const,
      resolve: { type: "payment" as const, id: payment.id, label: "Programar" },
    }));

  const overdueMaintenance = maintenance
    .filter((record) => record.status === "vencido")
    .slice(0, 2)
    .map((record) => ({
      id: `maintenance-${record.id}`,
      title: `${MAINTENANCE_TYPE_LABELS[record.type]} vencido`,
      detail: `${vehicleLabel(vehicles, record.vehicleId)} · ${formatDate(record.scheduledDate)} · ${record.workshop}`,
      href: "/admin/maintenance",
      badge: "Taller",
      tone: "danger" as const,
      icon: Wrench,
      category: "flota" as const,
      resolve: { type: "maintenance" as const, id: record.id, label: "Iniciar" },
    }));

  const licenseIssues = drivers
    .map((driver) => ({ driver, days: daysUntilDashboard(driver.licenseExpiresOn) }))
    .filter((item) => item.days <= CRITICAL_SOON_DAYS)
    .sort((a, b) => a.days - b.days)
    .slice(0, 2)
    .map(({ driver, days }) => ({
      id: `driver-${driver.id}`,
      title: days < 0 ? `Licencia vencida: ${driver.name}` : `Licencia por vencer: ${driver.name}`,
      detail: `${driver.licenseNumber} · ${formatDate(driver.licenseExpiresOn)}`,
      href: `/admin/drivers/${driver.id}`,
      badge: days < 0 ? "Vencida" : `${days} días`,
      tone: days < 0 ? ("danger" as const) : ("warning" as const),
      icon: UserCog,
      category: "flota" as const,
    }));

  const fuelIssues = fuel
    .filter((record) => record.validation === "por_revisar")
    .slice(0, 2)
    .map((record) => ({
      id: `fuel-${record.id}`,
      title: "Combustible por revisar",
      detail: `${vehicleLabel(vehicles, record.vehicleId)} · ${FUEL_VALIDATION_LABELS[record.validation]} · ${record.station}`,
      href: "/admin/fuel",
      badge: "Validar",
      tone: "warning" as const,
      icon: Fuel,
      category: "flota" as const,
      resolve: { type: "fuel" as const, id: record.id, label: "Validar" },
    }));

  return [
    ...highAlerts,
    ...unassignedTrips,
    ...overduePayments,
    ...overdueMaintenance,
    ...licenseIssues,
    ...fuelIssues,
  ];
}

function daysUntilDashboard(date: string) {
  const dayMs = 86_400_000;
  const target = Date.parse(`${date}T00:00:00`);
  const today = Date.parse(`${DASHBOARD_TODAY}T00:00:00`);
  return Math.ceil((target - today) / dayMs);
}

function CriticalItem({ item, onResolve }: { item: CriticalItemData; onResolve: () => void }) {
  const Icon = item.icon;
  return (
    <div className="group rounded-lg border border-border bg-card p-3 transition-colors hover:border-warning/40 hover:bg-warning-soft/50">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-warning-soft text-warning">
          <Icon className="h-4 w-4" />
        </span>
        <Badge tone={item.tone}>{item.badge}</Badge>
      </div>
      <Link href={item.href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <p className="mt-3 line-clamp-2 text-sm font-semibold text-foreground group-hover:text-warning">
          {item.title}
        </p>
      </Link>
      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.detail}</p>
      {item.resolve && (
        <button
          type="button"
          onClick={onResolve}
          className="mt-3 rounded-md border border-warning/30 bg-warning-soft px-2.5 py-1.5 text-xs font-semibold text-warning transition-colors hover:bg-warning/15"
        >
          {item.resolve.label}
        </button>
      )}
    </div>
  );
}

function TodayTaskItem({ item }: { item: TodayTaskData }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className="rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/30 hover:bg-primary-soft/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <Badge tone={item.tone}>{item.badge}</Badge>
      </div>
      <p className="mt-3 line-clamp-2 text-sm font-semibold">{item.title}</p>
      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.detail}</p>
    </Link>
  );
}

function cnCriticalFilter(active: boolean) {
  return active
    ? "rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
    : "rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground";
}

function ActivityItem({ item }: { item: AdminActivityEvent }) {
  const Icon = {
    servicio: RouteIcon,
    vehiculo: BusFront,
    conductor: UserCog,
    mantenimiento: Wrench,
    combustible: Fuel,
    contabilidad: Calculator,
    obligacion: ClipboardList,
  }[item.type];

  return (
    <Link
      href={item.href}
      className="rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/30 hover:bg-primary-soft/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-[11px] text-muted-foreground">{timeAgo(item.createdAt)}</span>
      </div>
      <p className="line-clamp-2 text-sm font-semibold">{item.title}</p>
      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.detail}</p>
    </Link>
  );
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
