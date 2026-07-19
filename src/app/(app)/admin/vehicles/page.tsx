"use client";

import { useRouter } from "next/navigation";
import { LayoutGrid, TableIcon } from "lucide-react";
import { useState } from "react";
import { useDemoStore } from "@/stores/demo-store";
import { useHydrated } from "@/lib/hooks";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column, type FilterConfig } from "@/components/shared/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/misc";
import { VehicleStatusBadge } from "@/components/shared/badges";
import { VEHICLE_STATUS_LABELS, VEHICLE_TYPE_LABELS } from "@/constants";
import type { Vehicle, VehicleStatus } from "@/types";
import { formatNumber } from "@/lib/utils";
import { driverName } from "@/lib/lookups";
import { FuelBar } from "@/components/admin/fuel-bar";

export default function VehiclesPage() {
  const hydrated = useHydrated();
  const router = useRouter();
  const { vehicles, drivers } = useDemoStore();
  const [view, setView] = useState<"cards" | "table">("cards");

  if (!hydrated) return <Skeleton className="h-96 w-full" />;

  const filters: FilterConfig<Vehicle>[] = [
    {
      label: "Estado",
      options: (Object.keys(VEHICLE_STATUS_LABELS) as VehicleStatus[]).map((s) => ({
        value: s,
        label: VEHICLE_STATUS_LABELS[s],
      })),
      predicate: (v, val) => v.status === val,
    },
  ];

  const columns: Column<Vehicle>[] = [
    { key: "code", header: "Unidad", render: (v) => <span className="font-medium">{v.code}</span> },
    { key: "vehicle", header: "Vehículo", render: (v) => `${v.brand} ${v.model} ${v.year}` },
    { key: "plates", header: "Placas", render: (v) => v.plates },
    { key: "type", header: "Tipo", render: (v) => <span className="text-xs">{VEHICLE_TYPE_LABELS[v.type]}</span> },
    { key: "cap", header: "Cap.", render: (v) => `${v.capacity} pax` },
    { key: "odo", header: "Kilometraje", render: (v) => <span className="tabular-nums">{formatNumber(v.odometerKm)} km</span> },
    { key: "fuel", header: "Combustible", render: (v) => <FuelBar level={v.fuelLevel} /> },
    { key: "driver", header: "Conductor", render: (v) => <span className="text-xs">{driverName(drivers, v.assignedDriverId)}</span> },
    { key: "status", header: "Estado", render: (v) => <VehicleStatusBadge status={v.status} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Vehículos"
        description="Flota de unidades y su estado operativo."
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Vehículos" }]}
        actions={
          <div className="flex rounded-md border border-input">
            <Button
              variant={view === "cards" ? "default" : "ghost"}
              size="sm"
              className="rounded-r-none"
              onClick={() => setView("cards")}
            >
              <LayoutGrid /> Tarjetas
            </Button>
            <Button
              variant={view === "table" ? "default" : "ghost"}
              size="sm"
              className="rounded-l-none"
              onClick={() => setView("table")}
            >
              <TableIcon /> Tabla
            </Button>
          </div>
        }
      />

      {view === "table" ? (
        <DataTable
          columns={columns}
          rows={vehicles}
          getRowId={(v) => v.id}
          searchPlaceholder="Buscar por unidad, placas, marca…"
          searchAccessor={(v) => `${v.code} ${v.plates} ${v.brand} ${v.model}`}
          filters={filters}
          onRowClick={(v) => router.push(`/admin/vehicles/${v.id}`)}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {vehicles.map((v) => (
            <Card
              key={v.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => router.push(`/admin/vehicles/${v.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-lg font-bold">{v.code}</p>
                    <p className="text-sm text-muted-foreground">{v.brand} {v.model} {v.year}</p>
                  </div>
                  <VehicleStatusBadge status={v.status} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <Info label="Placas" value={v.plates} />
                  <Info label="Tipo" value={VEHICLE_TYPE_LABELS[v.type]} />
                  <Info label="Capacidad" value={`${v.capacity} pax`} />
                  <Info label="Kilometraje" value={`${formatNumber(v.odometerKm)} km`} />
                  <Info label="Conductor" value={driverName(drivers, v.assignedDriverId)} />
                  <Info label="Ubicación" value={v.lastLocationName} />
                </div>
                <div className="mt-3">
                  <p className="mb-1 text-xs text-muted-foreground">Combustible</p>
                  <FuelBar level={v.fuelLevel} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className="truncate font-medium">{value}</p>
    </div>
  );
}
