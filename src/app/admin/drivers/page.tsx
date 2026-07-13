"use client";

import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { useDemoStore } from "@/stores/demo-store";
import { useHydrated } from "@/lib/hooks";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column, type FilterConfig } from "@/components/shared/data-table";
import { Skeleton } from "@/components/ui/misc";
import { DriverStatusBadge } from "@/components/shared/badges";
import { DRIVER_STATUS_LABELS } from "@/constants";
import type { Driver, DriverStatus } from "@/types";
import { formatNumber } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { vehicleLabel } from "@/lib/lookups";
import { Avatar } from "@/components/shared/avatar";

export default function DriversPage() {
  const hydrated = useHydrated();
  const router = useRouter();
  const { drivers, vehicles } = useDemoStore();

  if (!hydrated) return <Skeleton className="h-96 w-full" />;

  const filters: FilterConfig<Driver>[] = [
    {
      label: "Estado",
      options: (Object.keys(DRIVER_STATUS_LABELS) as DriverStatus[]).map((s) => ({
        value: s,
        label: DRIVER_STATUS_LABELS[s],
      })),
      predicate: (d, v) => d.status === v,
    },
  ];

  const columns: Column<Driver>[] = [
    {
      key: "name",
      header: "Conductor",
      render: (d) => (
        <div className="flex items-center gap-2">
          <Avatar name={d.name} />
          <span className="font-medium">{d.name}</span>
        </div>
      ),
    },
    { key: "phone", header: "Teléfono", render: (d) => <span className="text-xs">{d.phone}</span> },
    { key: "license", header: "Licencia", render: (d) => <span className="text-xs">{d.licenseNumber}</span> },
    { key: "exp", header: "Vigencia", render: (d) => <span className="text-xs">{formatDate(d.licenseExpiresOn, "dd MMM yyyy")}</span> },
    { key: "vehicle", header: "Unidad", render: (d) => <span className="text-xs">{vehicleLabel(vehicles, d.assignedVehicleId)}</span> },
    { key: "trips", header: "Viajes", render: (d) => <span className="tabular-nums">{d.completedTrips}</span> },
    {
      key: "rating",
      header: "Calificación",
      render: (d) => (
        <span className="inline-flex items-center gap-1 tabular-nums">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {d.rating}
        </span>
      ),
    },
    { key: "km", header: "Km conducidos", render: (d) => <span className="tabular-nums">{formatNumber(d.drivenKm)}</span> },
    { key: "status", header: "Estado", render: (d) => <DriverStatusBadge status={d.status} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Conductores"
        description="Personal de traslados, licencias y desempeño."
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Conductores" }]}
      />
      <DataTable
        columns={columns}
        rows={drivers}
        getRowId={(d) => d.id}
        searchPlaceholder="Buscar por nombre, teléfono o licencia…"
        searchAccessor={(d) => `${d.name} ${d.phone} ${d.licenseNumber}`}
        filters={filters}
        onRowClick={(d) => router.push(`/admin/drivers/${d.id}`)}
      />
    </div>
  );
}
