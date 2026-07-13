"use client";

import { Fuel, TrendingDown, AlertCircle, Download } from "lucide-react";
import { useDemoStore } from "@/stores/demo-store";
import { useHydrated } from "@/lib/hooks";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/misc";
import { DataTable, type Column, type FilterConfig } from "@/components/shared/data-table";
import { SimpleBarChart } from "@/components/charts/charts";
import { FuelValidationBadge } from "@/components/shared/badges";
import { FUEL_VALIDATION_LABELS } from "@/constants";
import type { FuelRecord, FuelValidation } from "@/types";
import { formatMXN, formatNumber } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { toast } from "@/components/ui/toast";
import { exportToCsv } from "@/lib/csv";

export default function FuelPage() {
  const hydrated = useHydrated();
  const { fuel, vehicles, drivers } = useDemoStore();

  if (!hydrated) return <Skeleton className="h-96 w-full" />;

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
    return { label: v.code, value: Number(avg.toFixed(1)), color: avg < 6 ? "#dc2626" : "#059669" };
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

  return (
    <div>
      <PageHeader
        title="Combustible"
        description="Cargas, rendimiento y anomalías por revisar."
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Combustible" }]}
        actions={
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download /> Exportar CSV
          </Button>
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
        <Card className="mt-4 border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertCircle className="h-4 w-4" /> Anomalías por revisar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-amber-700">
              Variaciones de consumo respecto al promedio de la unidad. Requieren revisión
              y evidencia; no implican una conclusión automática.
            </p>
            {anomalies.map((f) => (
              <div key={f.id} className="rounded-md border border-amber-200 bg-card p-2 text-sm">
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
        />
      </div>
    </div>
  );
}
