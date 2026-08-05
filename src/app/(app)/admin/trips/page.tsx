"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useDemoStore, type NewTripInput } from "@/stores/demo-store";
import { useHydrated } from "@/lib/hooks";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column, type FilterConfig } from "@/components/shared/data-table";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/misc";
import { TripStatusBadge } from "@/components/shared/badges";
import { TripForm } from "@/components/admin/trip-form";
import { toast } from "@/components/ui/toast";
import {
  SERVICE_TYPE_LABELS,
  TRIP_STATUS_LABELS,
} from "@/constants";
import type { BookingSource, PaymentStatus, Trip, TripStatus, ServiceType } from "@/types";
import type { TripFormValues } from "@/lib/schemas";
import { formatMXN, formatNumber } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { driverName, vehicleLabel } from "@/lib/lookups";

const SOURCE_LABELS: Record<BookingSource, string> = {
  web: "Web",
  admin: "Admin",
  whatsapp: "WhatsApp",
  agencia: "Agencia",
};

const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  pendiente: "Pago pendiente",
  parcial: "Pago parcial",
  pagado: "Pagado",
  cotizacion: "Cotización",
};

export default function TripsPage() {
  const hydrated = useHydrated();
  const router = useRouter();
  const { trips, vehicles, drivers, createTrip } = useDemoStore();
  const [openCreate, setOpenCreate] = useState(false);

  useEffect(() => {
    if (window.location.search.includes("new=1")) {
      setOpenCreate(true);
    }
  }, []);

  if (!hydrated) return <Skeleton className="h-96 w-full" />;

  const handleCreate = (values: TripFormValues) => {
    const input: NewTripInput = {
      ...values,
      driverId: values.driverId || null,
      vehicleId: values.vehicleId || null,
    };
    const trip = createTrip(input);
    setOpenCreate(false);
    toast.success(`Servicio ${trip.folio} creado.`);
    router.push(`/admin/trips/${trip.id}`);
  };

  const columns: Column<Trip>[] = [
    {
      key: "folio",
      header: "Folio",
      render: (t) => (
        <div className="space-y-1">
          <span className="font-medium">{t.folio}</span>
          <div className="flex flex-wrap gap-1">
            {t.bookingSource && <Badge tone={t.bookingSource === "web" ? "info" : "neutral"}>{SOURCE_LABELS[t.bookingSource]}</Badge>}
            {t.paymentStatus && (
              <Badge tone={t.paymentStatus === "pagado" ? "success" : t.paymentStatus === "cotizacion" ? "info" : "warning"}>
                {PAYMENT_LABELS[t.paymentStatus]}
              </Badge>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Tipo",
      render: (t) => (
        <span className="text-xs text-muted-foreground">{SERVICE_TYPE_LABELS[t.serviceType]}</span>
      ),
    },
    {
      key: "client",
      header: "Cliente",
      render: (t) => (
        <div>
          <p className="font-medium">{t.client}</p>
          {(t.contactPhone || t.contactEmail) && (
            <p className="text-xs text-muted-foreground">{t.contactPhone || t.contactEmail}</p>
          )}
        </div>
      ),
    },
    {
      key: "route",
      header: "Origen → Destino",
      render: (t) => (
        <span className="text-xs">
          {t.origin} <span className="text-muted-foreground">→</span> {t.destination}
        </span>
      ),
    },
    {
      key: "when",
      header: "Fecha / hora",
      render: (t) => (
        <span className="whitespace-nowrap text-xs">
          {formatDate(t.date, "dd MMM")} · {t.time}
        </span>
      ),
    },
    { key: "driver", header: "Conductor", render: (t) => <span className="text-xs">{driverName(drivers, t.driverId)}</span> },
    { key: "vehicle", header: "Unidad", render: (t) => <span className="text-xs">{vehicleLabel(vehicles, t.vehicleId)}</span> },
    {
      key: "km",
      header: "Km plan/real",
      render: (t) => (
        <span className="whitespace-nowrap text-xs tabular-nums">
          {formatNumber(t.plannedKm, 1)} / {t.realKm !== null ? formatNumber(t.realKm, 1) : "—"}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Importe",
      render: (t) => (
        <div className="text-right">
          <span className="tabular-nums">{t.amount > 0 ? formatMXN(t.amount) : "Por cotizar"}</span>
          <p className="text-xs text-muted-foreground">{t.direction === "redondo" ? "Redondo" : "Sencillo"}</p>
        </div>
      ),
      className: "text-right",
    },
    { key: "status", header: "Estado", render: (t) => <TripStatusBadge status={t.status} /> },
  ];

  const filters: FilterConfig<Trip>[] = [
    {
      label: "Estado",
      options: (Object.keys(TRIP_STATUS_LABELS) as TripStatus[]).map((s) => ({
        value: s,
        label: TRIP_STATUS_LABELS[s],
      })),
      predicate: (t, v) => t.status === v,
    },
    {
      label: "Tipo",
      options: (Object.keys(SERVICE_TYPE_LABELS) as ServiceType[]).map((s) => ({
        value: s,
        label: SERVICE_TYPE_LABELS[s],
      })),
      predicate: (t, v) => t.serviceType === v,
    },
    {
      label: "Origen",
      options: (["web", "admin", "whatsapp", "agencia"] as BookingSource[]).map((source) => ({
        value: source,
        label: SOURCE_LABELS[source],
      })),
      predicate: (t, v) => t.bookingSource === v,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Servicios / Viajes"
        description="Gestiona los traslados: crea, asigna, edita y da seguimiento."
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Servicios" }]}
        actions={
          <Button onClick={() => setOpenCreate(true)}>
            <Plus /> Nuevo servicio
          </Button>
        }
      />

      <DataTable
        columns={columns}
        rows={trips}
        getRowId={(t) => t.id}
        searchPlaceholder="Buscar por folio, cliente, teléfono, origen o destino…"
        searchAccessor={(t) => `${t.folio} ${t.client} ${t.contactPhone ?? ""} ${t.contactEmail ?? ""} ${t.origin} ${t.destination}`}
        filters={filters}
        onRowClick={(t) => router.push(`/admin/trips/${t.id}`)}
        emptyTitle="Sin servicios"
        emptyDescription="Crea el primer servicio con el botón «Nuevo servicio»."
      />

      <Dialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        title="Nuevo servicio"
        description="Los campos se adaptan según el tipo de traslado."
        className="max-w-2xl"
      >
        <TripForm onSubmit={handleCreate} onCancel={() => setOpenCreate(false)} />
      </Dialog>
    </div>
  );
}
