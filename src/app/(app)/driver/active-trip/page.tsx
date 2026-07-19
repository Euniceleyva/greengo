"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Phone,
  Plane,
  MapPin,
  Users,
  Luggage,
  Car,
  Info,
  ArrowRight,
  AlertTriangle,
  ChevronLeft,
} from "lucide-react";
import { useDemoStore } from "@/stores/demo-store";
import { useHydrated } from "@/lib/hooks";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/misc";
import { EmptyState } from "@/components/shared/states";
import { TripStatusBadge } from "@/components/shared/badges";
import { TripStepper } from "@/components/driver/trip-stepper";
import { MapView, type MapMarker, type MapRoute } from "@/components/maps/map-view";
import { PhotoInput } from "@/components/driver/photo-input";
import { toast } from "@/components/ui/toast";
import {
  SERVICE_TYPE_LABELS,
  DRIVER_STATUS_FLOW,
  DRIVER_ACTION_LABELS,
  TRIP_STATUS_LABELS,
} from "@/constants";
import type { TripStatus } from "@/types";
import { formatMXN } from "@/lib/utils";
import { vehicleLabel } from "@/lib/lookups";

export default function ActiveTripPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <ActiveTripContent />
    </Suspense>
  );
}

function ActiveTripContent() {
  const params = useSearchParams();
  const router = useRouter();
  const hydrated = useHydrated();
  const { trips, vehicles, updateTrip, setTripStatus } = useDemoStore();
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);
  const [startKm, setStartKm] = useState("");
  const [endKm, setEndKm] = useState("");

  const id = params.get("id");
  const trip = trips.find((t) => t.id === id);

  if (!hydrated) return <Skeleton className="h-96 w-full" />;
  if (!trip) {
    return (
      <EmptyState
        title="Servicio no encontrado"
        action={<Button onClick={() => router.push("/driver/services")}>Ver servicios</Button>}
      />
    );
  }

  // Siguiente estado del flujo del conductor
  const currentIndex = DRIVER_STATUS_FLOW.indexOf(trip.status);
  const nextStatus: TripStatus | null =
    currentIndex >= 0 && currentIndex < DRIVER_STATUS_FLOW.length - 1
      ? DRIVER_STATUS_FLOW[currentIndex + 1]
      : trip.status === "pendiente"
        ? "asignado"
        : null;

  const advance = () => {
    if (!nextStatus) return;
    // Al pasar a "en_curso" pedir kilometraje inicial; al "completado" pedir cierre.
    if (nextStatus === "en_curso") return setStartOpen(true);
    if (nextStatus === "completado") return setEndOpen(true);
    setTripStatus(trip.id, nextStatus);
    toast.success(`Estado: ${TRIP_STATUS_LABELS[nextStatus]}`);
  };

  const confirmStart = () => {
    updateTrip(trip.id, { startOdometer: Number(startKm) || trip.startOdometer });
    setTripStatus(trip.id, "en_curso");
    setStartOpen(false);
    toast.success("Viaje iniciado. ¡Buen camino!");
  };

  const confirmEnd = () => {
    updateTrip(trip.id, { endOdometer: Number(endKm) || undefined });
    setTripStatus(trip.id, "completado");
    setEndOpen(false);
    toast.success("Viaje finalizado y registrado.");
  };

  const routes: MapRoute[] = [{ points: trip.plannedRoute, color: "#00AFEE" }];
  const markers: MapMarker[] = [
    { id: "o", position: trip.originCoord, color: "#29876B", title: "Origen" },
    { id: "d", position: trip.destinationCoord, color: "#dc2626", title: "Destino" },
  ];

  return (
    <div className="space-y-4">
      <button
        onClick={() => router.back()}
        className="flex h-9 items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Volver
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-lg font-bold">{trip.folio}</h1>
          <p className="text-xs text-muted-foreground">{SERVICE_TYPE_LABELS[trip.serviceType]}</p>
        </div>
        <TripStatusBadge status={trip.status} />
      </div>

      {/* Progreso del servicio */}
      <Card>
        <CardContent className="p-4">
          <TripStepper status={trip.status} />
        </CardContent>
      </Card>

      {/* Mapa mock */}
      <div className="h-40 overflow-hidden rounded-lg">
        <MapView routes={routes} markers={markers} zoom={10} center={trip.originCoord} />
      </div>

      {/* Ruta */}
      <Card>
        <CardContent className="space-y-2 p-4 text-sm">
          <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-success" /> <strong>Origen:</strong> {trip.origin}</p>
          <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-destructive" /> <strong>Destino:</strong> {trip.destination}</p>
          <p className="flex items-center gap-2 text-muted-foreground"><Car className="h-4 w-4" /> {vehicleLabel(vehicles, trip.vehicleId)}</p>
        </CardContent>
      </Card>

      {/* Datos del pasajero */}
      <Card>
        <CardContent className="p-4">
          <h2 className="mb-2 text-sm font-semibold">Datos del servicio</h2>
          <div className="space-y-2 text-sm">
            <Row label="Pasajero / cliente" value={trip.client} />
            <Row icon={Phone} label="Teléfono" value="998-555-0100 (simulado)" />
            <Row icon={Users} label="Pasajeros" value={`${trip.passengers}`} />
            <Row icon={Luggage} label="Equipaje estimado" value={`${trip.passengers + 1} piezas`} />
            <Row label="Fecha y hora" value={`${trip.date} · ${trip.time} h`} />
            {trip.flightNumber && <Row icon={Plane} label="Vuelo" value={`${trip.flightNumber} · ${trip.airline ?? ""}`} />}
            <Row label="Tarifa" value={formatMXN(trip.amount)} />
          </div>
          {trip.specialReception && (
            <div className="mt-2 flex items-start gap-2 rounded-md bg-info-soft p-2 text-xs text-info">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Recepción personalizada solicitada.
            </div>
          )}
          {trip.specialInstructions && (
            <div className="mt-2 rounded-md bg-secondary p-2 text-xs text-muted-foreground">
              <strong>Instrucciones:</strong> {trip.specialInstructions}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Acciones de estado */}
      <div className="space-y-2">
        {nextStatus ? (
          <Button className="h-12 w-full text-base" onClick={advance}>
            {DRIVER_ACTION_LABELS[nextStatus] ?? `Marcar: ${TRIP_STATUS_LABELS[nextStatus]}`}
            <ArrowRight />
          </Button>
        ) : (
          <div className="rounded-lg bg-success-soft p-3 text-center text-sm font-medium text-success">
            Servicio {TRIP_STATUS_LABELS[trip.status].toLowerCase()}.
          </div>
        )}

        <Link href={`/driver/incidents?trip=${trip.id}`}>
          <Button variant="outline" className="h-11 w-full border-destructive/30 text-destructive hover:bg-destructive-soft">
            <AlertTriangle /> Reportar incidencia
          </Button>
        </Link>
      </div>

      {/* Inicio de viaje */}
      <Dialog open={startOpen} onClose={() => setStartOpen(false)} title="Iniciar viaje">
        <div className="space-y-3">
          <div>
            <Label className="mb-1 block">Kilometraje inicial</Label>
            <Input
              type="number"
              inputMode="numeric"
              placeholder={String(trip.startOdometer ?? "Ej. 84230")}
              value={startKm}
              onChange={(e) => setStartKm(e.target.value)}
            />
          </div>
          <div>
            <Label className="mb-1 block">Fotografía del odómetro</Label>
            <PhotoInput label="Tomar / adjuntar foto" />
          </div>
          <div>
            <Label className="mb-1 block">Nivel de combustible</Label>
            <Input type="range" min={0} max={100} defaultValue={60} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" defaultChecked className="h-4 w-4" /> Confirmo la unidad asignada
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" defaultChecked className="h-4 w-4" /> Confirmo el número de pasajeros
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setStartOpen(false)}>Cancelar</Button>
            <Button onClick={confirmStart}>Iniciar viaje</Button>
          </div>
        </div>
      </Dialog>

      {/* Cierre de viaje */}
      <Dialog open={endOpen} onClose={() => setEndOpen(false)} title="Finalizar viaje">
        <div className="space-y-3">
          <div>
            <Label className="mb-1 block">Kilometraje final</Label>
            <Input
              type="number"
              inputMode="numeric"
              placeholder="Ej. 84249"
              value={endKm}
              onChange={(e) => setEndKm(e.target.value)}
            />
          </div>
          <div>
            <Label className="mb-1 block">Nivel de combustible</Label>
            <Input type="range" min={0} max={100} defaultValue={45} />
          </div>
          <div>
            <Label className="mb-1 block">Observaciones</Label>
            <Input placeholder="Sin novedad" />
          </div>
          <div>
            <Label className="mb-1 block">Evidencia fotográfica</Label>
            <PhotoInput label="Adjuntar evidencia" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" defaultChecked className="h-4 w-4" /> Confirmación del pasajero (firma simulada)
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setEndOpen(false)}>Cancelar</Button>
            <Button variant="success" onClick={confirmEnd}>Finalizar</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon?: typeof Phone;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-1.5 text-muted-foreground">
        {Icon && <Icon className="h-3.5 w-3.5" />} {label}
      </span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
