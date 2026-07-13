"use client";

import { Wrench, CalendarClock, CircleAlert } from "lucide-react";
import { useDemoStore } from "@/stores/demo-store";
import { useHydrated } from "@/lib/hooks";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { Skeleton } from "@/components/ui/misc";
import { DataTable, type Column, type FilterConfig } from "@/components/shared/data-table";
import { MaintenanceStatusBadge } from "@/components/shared/badges";
import { MAINTENANCE_STATUS_LABELS, MAINTENANCE_TYPE_LABELS } from "@/constants";
import type { MaintenanceRecord, MaintenanceStatus } from "@/types";
import { formatMXN, formatNumber } from "@/lib/utils";
import { formatDate } from "@/lib/format";

export default function MaintenancePage() {
  const hydrated = useHydrated();
  const { maintenance, vehicles } = useDemoStore();

  if (!hydrated) return <Skeleton className="h-96 w-full" />;

  const vehicleName = (id: string) => vehicles.find((v) => v.id === id)?.code ?? id;

  const scheduled = maintenance.filter((m) => m.status === "programado").length;
  const overdue = maintenance.filter((m) => m.status === "vencido").length;
  const totalCost = maintenance.reduce((s, m) => s + m.estimatedCost, 0);

  const columns: Column<MaintenanceRecord>[] = [
    { key: "vehicle", header: "Unidad", render: (m) => <span className="font-medium">{vehicleName(m.vehicleId)}</span> },
    { key: "type", header: "Tipo", render: (m) => MAINTENANCE_TYPE_LABELS[m.type] },
    { key: "km", header: "Km actual / límite", render: (m) => <span className="tabular-nums text-xs">{formatNumber(m.currentKm)} / {formatNumber(m.limitKm)}</span> },
    { key: "date", header: "Fecha programada", render: (m) => <span className="text-xs">{formatDate(m.scheduledDate)}</span> },
    { key: "cost", header: "Costo estimado", render: (m) => <span className="tabular-nums">{formatMXN(m.estimatedCost)}</span> },
    { key: "workshop", header: "Taller", render: (m) => <span className="text-xs">{m.workshop}</span> },
    { key: "notes", header: "Observaciones", render: (m) => <span className="text-xs text-muted-foreground">{m.notes ?? "—"}</span> },
    { key: "status", header: "Estado", render: (m) => <MaintenanceStatusBadge status={m.status} /> },
  ];

  const filters: FilterConfig<MaintenanceRecord>[] = [
    {
      label: "Estado",
      options: (Object.keys(MAINTENANCE_STATUS_LABELS) as MaintenanceStatus[]).map((s) => ({
        value: s,
        label: MAINTENANCE_STATUS_LABELS[s],
      })),
      predicate: (m, v) => m.status === v,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Mantenimiento"
        description="Programación y seguimiento de servicios de la flota."
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Mantenimiento" }]}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Programados" value={scheduled} icon={CalendarClock} tone="primary" />
        <KpiCard label="Vencidos" value={overdue} icon={CircleAlert} tone="danger" />
        <KpiCard label="Registros totales" value={maintenance.length} icon={Wrench} tone="neutral" />
        <KpiCard label="Costo estimado total" value={formatMXN(totalCost)} icon={Wrench} tone="warning" />
      </div>

      <div className="mt-6">
        <DataTable
          columns={columns}
          rows={maintenance}
          getRowId={(m) => m.id}
          searchPlaceholder="Buscar por unidad o taller…"
          searchAccessor={(m) => `${vehicleName(m.vehicleId)} ${m.workshop}`}
          filters={filters}
        />
      </div>
    </div>
  );
}
