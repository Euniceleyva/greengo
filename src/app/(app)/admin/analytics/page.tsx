"use client";

import * as React from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  Fuel,
  Route,
  Star,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SimpleBarChart, type BarDatum } from "@/components/charts/charts";
import { useDemoStore } from "@/stores/demo-store";
import { SERVICE_TYPE_LABELS } from "@/constants";
import { cn, formatMXN, formatNumber } from "@/lib/utils";
import type { AccountingCommission, AccountingEntry, AccountingPayable, AccountingReceivable, Driver, FuelRecord, MaintenanceRecord, Trip, Vehicle } from "@/types";

export default function AnalyticsPage() {
  const { trips, vehicles, drivers, fuel, maintenance, accounting, receivables, payables, commissions } = useDemoStore();

  const routeProfitability = React.useMemo(() => buildRouteProfitability(trips), [trips]);
  const priceAnalysis = React.useMemo(() => buildPriceAnalysis(trips), [trips]);
  const driverPerformance = React.useMemo(() => buildDriverPerformance(drivers, trips, fuel), [drivers, trips, fuel]);
  const fuelAnalysis = React.useMemo(() => buildFuelAnalysis(vehicles, fuel, trips), [vehicles, fuel, trips]);
  const demandAnalysis = React.useMemo(() => buildDemandAnalysis(trips), [trips]);
  const cashFlow = React.useMemo(() => buildCashFlow(accounting, receivables, payables), [accounting, receivables, payables]);
  const maintenanceRisk = React.useMemo(() => buildMaintenanceRisk(vehicles, maintenance), [vehicles, maintenance]);
  const channelAnalysis = React.useMemo(() => buildChannelAnalysis(commissions), [commissions]);

  const bestRoute = routeProfitability[0];
  const weakRoute = [...routeProfitability].sort((a, b) => a.margin - b.margin)[0];
  const bestDriver = driverPerformance[0];
  const fuelRisk = fuelAnalysis.find((item) => item.performance < 7);

  return (
    <div>
      <PageHeader
        title="Análisis operativo"
        description="Lecturas ejecutivas para decidir precios, rutas, unidades, conductores y flujo de caja. Datos simulados del DEMO."
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Análisis" }]}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Ruta más rentable" value={bestRoute ? `${formatNumber(bestRoute.margin, 1)}%` : "—"} icon={Route} tone="success" hint={bestRoute?.label} />
        <KpiCard label="Flujo próximo" value={formatMXN(cashFlow.net)} icon={Banknote} tone={cashFlow.net >= 0 ? "primary" : "warning"} hint="Cobros menos pagos" />
        <KpiCard label="Mejor conductor" value={bestDriver?.shortName ?? "—"} icon={Star} tone="info" hint={bestDriver ? `${bestDriver.score} pts` : undefined} />
        <KpiCard label="Riesgo combustible" value={fuelRisk?.vehicleCode ?? "Sin riesgo"} icon={Fuel} tone={fuelRisk ? "warning" : "success"} hint={fuelRisk ? `${fuelRisk.performance.toFixed(1)} km/L` : "Rendimiento sano"} />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Rentabilidad por ruta</CardTitle>
            <CardDescription>Ingresos menos costo estimado por km, tiempo operativo y comisión base.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {routeProfitability.map((route) => (
              <InsightRow
                key={route.label}
                title={route.label}
                detail={`${route.trips} servicios · ingresos ${formatMXN(route.income)} · costo ${formatMXN(route.cost)}`}
                value={formatMXN(route.profit)}
                badge={`${formatNumber(route.margin, 1)}% margen`}
                tone={route.margin >= 45 ? "success" : route.margin >= 25 ? "info" : "warning"}
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Precio por ruta</CardTitle>
            <CardDescription>Detecta servicios con tarifa baja respecto al costo estimado.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {priceAnalysis.map((item) => (
              <InsightRow
                key={item.id}
                title={item.route}
                detail={`${formatMXN(item.amount)} · ${formatNumber(item.pricePerKm)} MXN/km`}
                value={item.recommendation}
                badge={item.status === "bien" ? "Sano" : "Revisar"}
                tone={item.status === "bien" ? "success" : "warning"}
              />
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Desempeño por conductor</CardTitle>
            <CardDescription>Servicios, ingresos asociados, calificación, incidencias y rendimiento.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {driverPerformance.map((driver) => (
              <div key={driver.id} className="rounded-lg border border-border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{driver.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {driver.trips} servicios · {formatMXN(driver.revenue)} · {driver.rating} estrellas
                    </p>
                  </div>
                  <Badge tone={driver.score >= 85 ? "success" : driver.score >= 70 ? "info" : "warning"}>{driver.score} pts</Badge>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  <MiniMetric label="Incidencias" value={String(driver.incidents)} />
                  <MiniMetric label="Rendimiento" value={`${driver.fuelPerformance.toFixed(1)} km/L`} />
                  <MiniMetric label="Margen" value={`${driver.margin.toFixed(1)}%`} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Combustible por unidad</CardTitle>
            <CardDescription>Gasto, litros y rendimiento promedio por vehículo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {fuelAnalysis.map((item) => (
              <InsightRow
                key={item.vehicleId}
                title={item.vehicleCode}
                detail={`${formatNumber(item.liters)} L · ${formatMXN(item.cost)} · ${item.services} servicios`}
                value={`${item.performance.toFixed(1)} km/L`}
                badge={item.performance < 7 ? "Revisar" : "Correcto"}
                tone={item.performance < 7 ? "warning" : "success"}
              />
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Demanda por temporada y horario</CardTitle>
            <CardDescription>Servicios por mes y horarios de mayor operación.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
            <SimpleBarChart data={demandAnalysis.monthlyChart} unit="servicios" height={240} />
            <div className="space-y-3">
              {demandAnalysis.hourBlocks.map((block) => (
                <InsightRow
                  key={block.label}
                  title={block.label}
                  detail={`${block.count} servicios`}
                  value={`${formatNumber(block.share, 1)}%`}
                  badge={block.count === demandAnalysis.maxHourBlock ? "Pico" : undefined}
                  tone={block.count === demandAnalysis.maxHourBlock ? "warning" : "neutral"}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Flujo futuro</CardTitle>
            <CardDescription>Cobros pendientes contra pagos próximos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <CashLine label="Por cobrar" value={cashFlow.receivable} tone="success" icon={ArrowUpRight} />
            <CashLine label="Por pagar" value={cashFlow.payable} tone="warning" icon={ArrowDownRight} />
            <div className="border-t border-border pt-3">
              <CashLine label="Flujo neto" value={cashFlow.net} tone={cashFlow.net >= 0 ? "success" : "warning"} icon={Banknote} strong />
            </div>
            <p className="rounded-lg bg-secondary/60 p-3 text-xs text-muted-foreground">
              Si el flujo neto baja de cero, conviene acelerar anticipos o mover pagos no críticos.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Mantenimiento preventivo</CardTitle>
            <CardDescription>Unidades próximas a servicio y costo histórico de taller.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {maintenanceRisk.map((item) => (
              <InsightRow
                key={item.vehicleId}
                title={item.vehicleCode}
                detail={`${formatNumber(item.kmRemaining)} km restantes · taller ${formatMXN(item.cost)}`}
                value={item.recommendation}
                badge={item.kmRemaining < 2500 ? "Prioridad" : "Programar"}
                tone={item.kmRemaining < 2500 ? "warning" : "info"}
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Canales y comisiones</CardTitle>
            <CardDescription>Agencias, hoteles y conductores según ingresos y pagos asociados.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {channelAnalysis.map((item) => (
              <InsightRow
                key={item.name}
                title={item.name}
                detail={`${item.source} · ventas ${formatMXN(item.sales)} · comisión ${formatMXN(item.commission)}`}
                value={`${formatNumber(item.netShare, 1)}% neto`}
                badge={item.status}
                tone={item.status === "pagado" ? "success" : "warning"}
              />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function buildRouteProfitability(trips: Trip[]) {
  const groups = new Map<string, Trip[]>();
  trips.forEach((trip) => {
    const key = simplifyRoute(trip.destination);
    groups.set(key, [...(groups.get(key) ?? []), trip]);
  });
  return [...groups.entries()]
    .map(([label, items]) => {
      const income = items.reduce((sum, trip) => sum + trip.amount, 0);
      const km = items.reduce((sum, trip) => sum + (trip.realKm ?? trip.plannedKm), 0);
      const minutes = items.reduce((sum, trip) => sum + (trip.realMinutes ?? trip.estimatedMinutes), 0);
      const commission = income * 0.08;
      const cost = Math.round(km * 18 + minutes * 8 + commission);
      const profit = income - cost;
      return {
        label,
        trips: items.length,
        income,
        cost,
        profit,
        margin: income > 0 ? (profit / income) * 100 : 0,
      };
    })
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 6);
}

function buildPriceAnalysis(trips: Trip[]) {
  return trips
    .slice(0, 8)
    .map((trip) => {
      const km = trip.realKm ?? trip.plannedKm;
      const pricePerKm = trip.amount / Math.max(km, 1);
      const target = trip.serviceType === "aeropuerto" ? 85 : trip.serviceType === "transporte_abierto" ? 120 : 95;
      return {
        id: trip.id,
        route: `${SERVICE_TYPE_LABELS[trip.serviceType]} · ${simplifyRoute(trip.destination)}`,
        amount: trip.amount,
        pricePerKm,
        status: pricePerKm >= target ? "bien" : "revisar",
        recommendation: pricePerKm >= target ? "Tarifa sana" : `Subir a ${formatMXN(Math.round(target * km))}`,
      };
    })
    .sort((a, b) => a.pricePerKm - b.pricePerKm);
}

function buildDriverPerformance(drivers: Driver[], trips: Trip[], fuel: FuelRecord[]) {
  return drivers
    .map((driver) => {
      const driverTrips = trips.filter((trip) => trip.driverId === driver.id);
      const revenue = driverTrips.reduce((sum, trip) => sum + trip.amount, 0);
      const completed = driverTrips.filter((trip) => trip.status === "completado").length;
      const driverFuel = fuel.filter((record) => record.driverId === driver.id && record.performanceKmL);
      const fuelPerformance =
        driverFuel.reduce((sum, record) => sum + (record.performanceKmL ?? 0), 0) / (driverFuel.length || 1);
      const margin = revenue > 0 ? ((revenue - driver.incidents * 450 - driverFuel.length * 280) / revenue) * 100 : 0;
      const score = Math.round(driver.rating * 12 + completed * 4 - driver.incidents * 5 + Math.min(fuelPerformance, 12));
      return {
        id: driver.id,
        name: driver.name,
        shortName: driver.name.split(" ")[0],
        trips: driverTrips.length,
        completed,
        revenue,
        rating: driver.rating,
        incidents: driver.incidents,
        fuelPerformance,
        margin,
        score,
      };
    })
    .filter((driver) => driver.trips > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
}

function buildFuelAnalysis(vehicles: Vehicle[], fuel: FuelRecord[], trips: Trip[]) {
  return vehicles.map((vehicle) => {
    const records = fuel.filter((record) => record.vehicleId === vehicle.id);
    const liters = records.reduce((sum, record) => sum + record.liters, 0);
    const cost = records.reduce((sum, record) => sum + record.total, 0);
    const performanceRecords = records.filter((record) => record.performanceKmL);
    const performance =
      performanceRecords.reduce((sum, record) => sum + (record.performanceKmL ?? 0), 0) / (performanceRecords.length || 1);
    const services = trips.filter((trip) => trip.vehicleId === vehicle.id).length;
    return {
      vehicleId: vehicle.id,
      vehicleCode: `${vehicle.code} · ${vehicle.model}`,
      liters,
      cost,
      performance,
      services,
    };
  });
}

function buildDemandAnalysis(trips: Trip[]) {
  const monthCounts = new Map<string, number>();
  trips.forEach((trip) => {
    const label = format(parseISO(trip.date), "MMM", { locale: es });
    monthCounts.set(label, (monthCounts.get(label) ?? 0) + 1);
  });
  const monthlyChart: BarDatum[] = [...monthCounts.entries()].map(([label, value]) => ({
    label,
    value,
    color: "#94D9D9",
  }));
  const blocks = [
    { label: "Mañana", start: 5, end: 11 },
    { label: "Mediodía", start: 12, end: 15 },
    { label: "Tarde", start: 16, end: 20 },
    { label: "Noche", start: 21, end: 23 },
  ];
  const hourBlocks = blocks.map((block) => {
    const count = trips.filter((trip) => {
      const hour = Number(trip.time.split(":")[0]);
      return hour >= block.start && hour <= block.end;
    }).length;
    return {
      ...block,
      count,
      share: trips.length > 0 ? (count / trips.length) * 100 : 0,
    };
  });
  return {
    monthlyChart,
    hourBlocks,
    maxHourBlock: Math.max(...hourBlocks.map((block) => block.count), 0),
  };
}

function buildCashFlow(accounting: AccountingEntry[], receivables: AccountingReceivable[], payables: AccountingPayable[]) {
  const receivable = receivables.reduce((sum, item) => sum + Math.max(item.total - item.paid, 0), 0);
  const payable = payables.filter((item) => item.status !== "pagado").reduce((sum, item) => sum + item.amount, 0);
  const pendingAccounting = accounting
    .filter((entry) => entry.status === "pendiente")
    .reduce((sum, entry) => sum + (entry.type === "ingreso" ? entry.amount : -entry.amount), 0);
  return {
    receivable,
    payable,
    net: receivable - payable + pendingAccounting,
  };
}

function buildMaintenanceRisk(vehicles: Vehicle[], maintenance: MaintenanceRecord[]) {
  return vehicles
    .map((vehicle) => {
      const kmRemaining = vehicle.nextMaintenanceKm - vehicle.odometerKm;
      const cost = maintenance
        .filter((record) => record.vehicleId === vehicle.id)
        .reduce((sum, record) => sum + record.estimatedCost, 0);
      return {
        vehicleId: vehicle.id,
        vehicleCode: `${vehicle.code} · ${vehicle.model}`,
        kmRemaining,
        cost,
        recommendation: kmRemaining < 2500 ? "Agendar esta semana" : "Mantener monitoreo",
      };
    })
    .sort((a, b) => a.kmRemaining - b.kmRemaining);
}

function buildChannelAnalysis(commissions: AccountingCommission[]) {
  return commissions.map((item) => {
    const commission = (item.sales * item.rate) / 100;
    return {
      name: item.name,
      source: item.source,
      sales: item.sales,
      commission,
      netShare: item.sales > 0 ? ((item.sales - commission) / item.sales) * 100 : 0,
      status: item.status,
    };
  }).sort((a, b) => b.sales - a.sales);
}

function simplifyRoute(destination: string) {
  const clean = destination.toLowerCase();
  if (clean.includes("tulum")) return "Tulum";
  if (clean.includes("playa")) return "Playa del Carmen";
  if (clean.includes("xcaret")) return "Xcaret";
  if (clean.includes("cozumel")) return "Cozumel";
  if (clean.includes("hotelera") || clean.includes("hotel")) return "Zona Hotelera";
  if (clean.includes("mujeres")) return "Isla Mujeres";
  return destination.length > 26 ? `${destination.slice(0, 26)}…` : destination;
}

function InsightRow({
  title,
  detail,
  value,
  badge,
  tone = "neutral",
}: {
  title: string;
  detail: string;
  value: string;
  badge?: string;
  tone?: "neutral" | "success" | "warning" | "info";
}) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p>
        </div>
        <span className="shrink-0 text-right text-sm font-bold tabular-nums">{value}</span>
      </div>
      {badge && (
        <Badge
          className="mt-2"
          tone={tone === "success" ? "success" : tone === "warning" ? "warning" : tone === "info" ? "info" : "neutral"}
        >
          {badge}
        </Badge>
      )}
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-secondary/60 p-2">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-semibold">{value}</p>
    </div>
  );
}

function CashLine({
  label,
  value,
  tone,
  strong = false,
  icon: Icon,
}: {
  label: string;
  value: number;
  tone: "success" | "warning";
  strong?: boolean;
  icon: LucideIcon;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" /> {label}
      </span>
      <span className={cn("text-right tabular-nums", strong ? "text-lg font-bold" : "font-semibold", tone === "success" ? "text-success" : "text-warning")}>
        {formatMXN(value)}
      </span>
    </div>
  );
}
