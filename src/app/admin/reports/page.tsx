"use client";

import { useState } from "react";
import { Download, BarChart3 } from "lucide-react";
import { useDemoStore } from "@/stores/demo-store";
import { useHydrated } from "@/lib/hooks";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/misc";
import { SimpleBarChart, type BarDatum } from "@/components/charts/charts";
import { SERVICE_TYPE_LABELS } from "@/constants";
import type { ServiceType } from "@/types";
import { formatMXN, formatNumber } from "@/lib/utils";
import { exportToCsv } from "@/lib/csv";
import { toast } from "@/components/ui/toast";

const REPORTS = [
  { id: "km_driver", label: "Km por conductor" },
  { id: "km_vehicle", label: "Km por vehículo" },
  { id: "km_service", label: "Km por servicio" },
  { id: "km_unauthorized", label: "Km no autorizados" },
  { id: "fuel_vehicle", label: "Consumo por unidad" },
  { id: "perf_vehicle", label: "Rendimiento de combustible" },
  { id: "services_type", label: "Servicios por tipo" },
  { id: "incidents_driver", label: "Incidencias por conductor" },
  { id: "profit_vehicle", label: "Rentabilidad por unidad" },
] as const;

type ReportId = (typeof REPORTS)[number]["id"];

export default function ReportsPage() {
  const hydrated = useHydrated();
  const store = useDemoStore();
  const [active, setActive] = useState<ReportId>("km_driver");

  if (!hydrated) return <Skeleton className="h-96 w-full" />;

  const { trips, vehicles, drivers, fuel, incidents } = store;

  function buildData(id: ReportId): { data: BarDatum[]; unit: string; money?: boolean } {
    switch (id) {
      case "km_driver":
        return {
          unit: "km",
          data: drivers
            .map((d) => ({
              label: d.name.split(" ")[0],
              value: Math.round(trips.filter((t) => t.driverId === d.id).reduce((s, t) => s + (t.realKm ?? 0), 0)),
            }))
            .filter((d) => d.value > 0),
        };
      case "km_vehicle":
        return {
          unit: "km",
          data: vehicles.map((v) => ({
            label: v.code,
            value: Math.round(trips.filter((t) => t.vehicleId === v.id).reduce((s, t) => s + (t.realKm ?? 0), 0)),
          })),
        };
      case "km_service":
        return {
          unit: "km",
          data: (Object.keys(SERVICE_TYPE_LABELS) as ServiceType[]).map((s) => ({
            label: SERVICE_TYPE_LABELS[s].split(" ")[0],
            value: Math.round(trips.filter((t) => t.serviceType === s).reduce((sum, t) => sum + (t.realKm ?? t.plannedKm), 0)),
          })),
        };
      case "km_unauthorized":
        return {
          unit: "km",
          data: vehicles
            .map((v) => ({
              label: v.code,
              value: Number(trips.filter((t) => t.vehicleId === v.id).reduce((s, t) => s + t.offRouteKm, 0).toFixed(1)),
              color: "#d97706",
            }))
            .filter((d) => d.value > 0),
        };
      case "fuel_vehicle":
        return {
          unit: "L",
          data: vehicles.map((v) => ({
            label: v.code,
            value: fuel.filter((f) => f.vehicleId === v.id).reduce((s, f) => s + f.liters, 0),
            color: "#059669",
          })),
        };
      case "perf_vehicle":
        return {
          unit: "km/L",
          data: vehicles.map((v) => {
            const recs = fuel.filter((f) => f.vehicleId === v.id && f.performanceKmL);
            const avg = recs.reduce((s, f) => s + (f.performanceKmL ?? 0), 0) / (recs.length || 1);
            return { label: v.code, value: Number(avg.toFixed(1)), color: avg < 6 ? "#dc2626" : "#059669" };
          }),
        };
      case "services_type":
        return {
          unit: "servicios",
          data: (Object.keys(SERVICE_TYPE_LABELS) as ServiceType[]).map((s) => ({
            label: SERVICE_TYPE_LABELS[s].split(" ")[0],
            value: trips.filter((t) => t.serviceType === s).length,
          })),
        };
      case "incidents_driver":
        return {
          unit: "incidencias",
          data: drivers
            .map((d) => ({
              label: d.name.split(" ")[0],
              value: incidents.filter((i) => i.driverId === d.id).length + d.incidents,
              color: "#dc2626",
            }))
            .filter((d) => d.value > 0),
        };
      case "profit_vehicle":
        return {
          unit: "MXN",
          money: true,
          data: vehicles.map((v) => {
            const income = trips
              .filter((t) => t.vehicleId === v.id && t.status === "completado")
              .reduce((s, t) => s + t.amount, 0);
            const fuelCost = fuel.filter((f) => f.vehicleId === v.id).reduce((s, f) => s + f.total, 0);
            return { label: v.code, value: Math.round(income - fuelCost * 0.4), color: income - fuelCost > 0 ? "#059669" : "#dc2626" };
          }),
        };
    }
  }

  const { data, unit, money } = buildData(active);
  const activeLabel = REPORTS.find((r) => r.id === active)!.label;

  const handleExport = () => {
    exportToCsv(
      `reporte_${active}`,
      data.map((d) => ({ Concepto: d.label, Valor: d.value, Unidad: unit })),
    );
    toast.success(`Reporte «${activeLabel}» exportado (CSV).`);
  };

  return (
    <div>
      <PageHeader
        title="Reportes"
        description="Indicadores operativos y financieros simulados. Exporta a CSV."
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Reportes" }]}
      />

      <div className="grid gap-4 lg:grid-cols-4">
        <Card className="lg:col-span-1">
          <CardContent className="p-2">
            <div className="space-y-1">
              {REPORTS.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setActive(r.id)}
                  className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                    active === r.id ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  {r.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>{activeLabel}</CardTitle>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download /> Exportar CSV
            </Button>
          </CardHeader>
          <CardContent>
            {data.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">Sin datos para este reporte.</p>
            ) : (
              <>
                <SimpleBarChart data={data} unit={money ? "" : unit} height={300} />
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-muted-foreground">
                        <th className="py-2">Concepto</th>
                        <th className="py-2 text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((d, i) => (
                        <tr key={i} className="border-b border-border last:border-0">
                          <td className="py-2">{d.label}</td>
                          <td className="py-2 text-right tabular-nums">
                            {money ? formatMXN(d.value) : `${formatNumber(d.value, unit === "km/L" ? 1 : 0)} ${unit}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
