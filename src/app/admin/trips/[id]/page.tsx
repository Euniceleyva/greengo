"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  UserCog,
  Route as RouteIcon,
  Clock,
  MapPin,
  Plane,
  Info,
} from "lucide-react";
import { useDemoStore } from "@/stores/demo-store";
import { useHydrated } from "@/lib/hooks";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Select, Label } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/misc";
import { EmptyState } from "@/components/shared/states";
import { TripStatusBadge } from "@/components/shared/badges";
import { MapView, type MapRoute, type MapMarker } from "@/components/maps/map-view";
import { TripForm } from "@/components/admin/trip-form";
import { toast } from "@/components/ui/toast";
import {
  SERVICE_TYPE_LABELS,
  TRIP_STATUS_LABELS,
} from "@/constants";
import type { TripStatus } from "@/types";
import type { TripFormValues } from "@/lib/schemas";
import { formatMXN, formatNumber } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { driverName, vehicleLabel } from "@/lib/lookups";

const ALL_STATUSES = Object.keys(TRIP_STATUS_LABELS) as TripStatus[];

export default function TripDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const hydrated = useHydrated();
  const { trips, vehicles, drivers, updateTrip, setTripStatus, assignTrip } = useDemoStore();
  const [editOpen, setEditOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);

  const trip = trips.find((t) => t.id === params.id);

  if (!hydrated) return <Skeleton className="h-96 w-full" />;
  if (!trip) {
    return (
      <EmptyState
        title="Servicio no encontrado"
        description="El servicio pudo haberse restablecido o no existe."
        action={
          <Button onClick={() => router.push("/admin/trips")}>Volver a servicios</Button>
        }
      />
    );
  }

  const handleEdit = (values: TripFormValues) => {
    updateTrip(trip.id, {
      ...values,
      driverId: values.driverId || null,
      vehicleId: values.vehicleId || null,
    });
    setEditOpen(false);
    toast.success("Servicio actualizado.");
  };

  const diffKm = trip.realKm !== null ? trip.realKm - trip.plannedKm : null;
  const diffMin = trip.realMinutes !== null ? trip.realMinutes - trip.estimatedMinutes : null;

  const routes: MapRoute[] = [{ points: trip.plannedRoute, color: "#0369a1" }];
  if (trip.actualRoute.length > 1) {
    routes.push({ points: trip.actualRoute, color: "#dc2626", dashed: true });
  }
  const markers: MapMarker[] = [
    { id: "o", position: trip.originCoord, color: "#059669", title: "Origen", popup: <span className="text-xs">Origen: {trip.origin}</span> },
    { id: "d", position: trip.destinationCoord, color: "#dc2626", title: "Destino", popup: <span className="text-xs">Destino: {trip.destination}</span> },
  ];

  return (
    <div>
      <PageHeader
        title={trip.folio}
        description={SERVICE_TYPE_LABELS[trip.serviceType] + " · " + trip.client}
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Servicios", href: "/admin/trips" },
          { label: trip.folio },
        ]}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => router.push("/admin/trips")}>
              <ArrowLeft /> Volver
            </Button>
            <Button variant="outline" size="sm" onClick={() => setAssignOpen(true)}>
              <UserCog /> Asignar
            </Button>
            <Button size="sm" onClick={() => setEditOpen(true)}>
              <Pencil /> Editar
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Datos + estado */}
        <div className="space-y-4 lg:col-span-1">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Estado del servicio</CardTitle>
              <TripStatusBadge status={trip.status} />
            </CardHeader>
            <CardContent>
              <Label className="mb-1 block">Cambiar estado</Label>
              <Select
                value={trip.status}
                onChange={(e) => {
                  setTripStatus(trip.id, e.target.value as TripStatus);
                  toast.success(`Estado: ${TRIP_STATUS_LABELS[e.target.value as TripStatus]}`);
                }}
              >
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {TRIP_STATUS_LABELS[s]}
                  </option>
                ))}
              </Select>
              <p className="mt-2 text-xs text-muted-foreground">
                El estado se comparte con la app del conductor.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detalles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row label="Cliente" value={trip.client} />
              <Row label="Pasajeros" value={String(trip.passengers)} />
              <Row label="Origen" value={trip.origin} />
              <Row label="Destino" value={trip.destination} />
              <Row label="Fecha" value={`${formatDate(trip.date)} · ${trip.time} h`} />
              {trip.flightNumber && <Row label="Vuelo" value={`${trip.flightNumber} (${trip.airline ?? "—"})`} />}
              {trip.hotel && <Row label="Hotel" value={trip.hotel} />}
              {trip.durationHours && <Row label="Duración" value={`${trip.durationHours} h`} />}
              {trip.discount ? <Row label="Descuento" value={`${trip.discount}%`} /> : null}
              <Row label="Conductor" value={driverName(drivers, trip.driverId)} />
              <Row label="Unidad" value={vehicleLabel(vehicles, trip.vehicleId)} />
              <Row label="Importe" value={formatMXN(trip.amount)} />
              {trip.specialReception && (
                <div className="flex items-start gap-2 rounded-md bg-violet-50 p-2 text-xs text-violet-700">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Recepción personalizada solicitada.
                </div>
              )}
              {trip.specialInstructions && (
                <div className="rounded-md bg-secondary p-2 text-xs text-muted-foreground">
                  {trip.specialInstructions}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Comparación de ruta */}
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Comparación de ruta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="h-1 w-6 rounded bg-[#0369a1]" /> Ruta planeada
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-1 w-6 rounded bg-[#dc2626]" style={{ borderTop: "2px dashed #dc2626" }} /> Ruta recorrida
                </span>
              </div>
              <div className="h-72 overflow-hidden rounded-lg">
                <MapView routes={routes} markers={markers} zoom={10} center={trip.originCoord} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Metric icon={RouteIcon} label="Distancia planeada" value={`${formatNumber(trip.plannedKm, 1)} km`} />
                <Metric icon={RouteIcon} label="Distancia real" value={trip.realKm !== null ? `${formatNumber(trip.realKm, 1)} km` : "En curso"} />
                <Metric
                  icon={RouteIcon}
                  label="Diferencia"
                  value={diffKm !== null ? `${diffKm > 0 ? "+" : ""}${formatNumber(diffKm, 1)} km` : "—"}
                  tone={diffKm !== null && diffKm > 2 ? "warning" : "neutral"}
                />
                <Metric icon={Clock} label="Tiempo estimado" value={`${trip.estimatedMinutes} min`} />
                <Metric icon={Clock} label="Tiempo real" value={trip.realMinutes !== null ? `${trip.realMinutes} min` : "En curso"} />
                <Metric
                  icon={Clock}
                  label="Diferencia tiempo"
                  value={diffMin !== null ? `${diffMin > 0 ? "+" : ""}${diffMin} min` : "—"}
                  tone={diffMin !== null && diffMin > 10 ? "warning" : "neutral"}
                />
                <Metric icon={MapPin} label="Paradas realizadas" value={String(trip.stops)} />
                <Metric icon={RouteIcon} label="Desvíos detectados" value={String(trip.detours)} tone={trip.detours > 0 ? "warning" : "neutral"} />
                <Metric icon={RouteIcon} label="Km fuera de ruta" value={`${formatNumber(trip.offRouteKm, 1)} km`} tone={trip.offRouteKm > 1 ? "danger" : "neutral"} />
              </div>
            </CardContent>
          </Card>

          {(trip.serviceType === "aeropuerto" && trip.flightNumber) && (
            <Card>
              <CardContent className="flex items-center gap-3 py-4 text-sm">
                <Plane className="h-5 w-5 text-sky-600" />
                Vuelo <strong>{trip.flightNumber}</strong> · {trip.airline} — monitorea el estatus del vuelo con la aerolínea.
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Editar */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} title="Editar servicio" className="max-w-2xl">
        <TripForm initial={trip} onSubmit={handleEdit} onCancel={() => setEditOpen(false)} />
      </Dialog>

      {/* Asignar */}
      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} title="Asignar conductor y unidad">
        <AssignForm
          currentDriver={trip.driverId}
          currentVehicle={trip.vehicleId}
          onSubmit={(d, v) => {
            assignTrip(trip.id, d, v);
            setAssignOpen(false);
            toast.success("Asignación actualizada.");
          }}
          onCancel={() => setAssignOpen(false)}
        />
      </Dialog>
    </div>
  );
}

function AssignForm({
  currentDriver,
  currentVehicle,
  onSubmit,
  onCancel,
}: {
  currentDriver: string | null;
  currentVehicle: string | null;
  onSubmit: (driverId: string | null, vehicleId: string | null) => void;
  onCancel: () => void;
}) {
  const drivers = useDemoStore((s) => s.drivers);
  const vehicles = useDemoStore((s) => s.vehicles);
  const [driver, setDriver] = useState(currentDriver ?? "");
  const [vehicle, setVehicle] = useState(currentVehicle ?? "");

  return (
    <div className="space-y-4">
      <div>
        <Label className="mb-1 block">Conductor</Label>
        <Select value={driver} onChange={(e) => setDriver(e.target.value)}>
          <option value="">Sin asignar</option>
          {drivers.filter((d) => d.status !== "inactivo").map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </Select>
      </div>
      <div>
        <Label className="mb-1 block">Vehículo</Label>
        <Select value={vehicle} onChange={(e) => setVehicle(e.target.value)}>
          <option value="">Sin asignar</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>{v.code} · {v.plates}</option>
          ))}
        </Select>
      </div>
      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button onClick={() => onSubmit(driver || null, vehicle || null)}>Guardar</Button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  tone = "neutral",
}: {
  icon: typeof RouteIcon;
  label: string;
  value: string;
  tone?: "neutral" | "warning" | "danger";
}) {
  const toneClass =
    tone === "danger" ? "text-red-600" : tone === "warning" ? "text-amber-600" : "text-foreground";
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <p className={`mt-1 text-sm font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}
