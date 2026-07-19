"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Car, Clock, MapPin, ArrowRight, AlertTriangle, CheckCircle2, Fuel } from "lucide-react";
import { useDemoStore } from "@/stores/demo-store";
import { useHydrated } from "@/lib/hooks";
import { useActiveDriverId } from "@/lib/use-active-driver";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/misc";
import { TripStatusBadge } from "@/components/shared/badges";
import { DriverStatusBadge } from "@/components/shared/badges";
import { toast } from "@/components/ui/toast";
import {
  SERVICE_TYPE_LABELS,
  DRIVER_STATUS_FLOW,
  DRIVER_ACTION_LABELS,
  TRIP_STATUS_LABELS,
} from "@/constants";
import type { TripStatus } from "@/types";
import { isToday } from "@/lib/lookups";
import { formatDate } from "@/lib/format";

// Pasos del flujo de estado que requieren captura de datos (kilometraje, fotos)
// y por lo tanto deben resolverse en el detalle del servicio, no en un solo tap.
const STEPS_REQUIRING_DETAIL: TripStatus[] = ["en_curso", "completado"];

export default function DriverHomePage() {
  const hydrated = useHydrated();
  const router = useRouter();
  const driverId = useActiveDriverId();
  const { drivers, trips, vehicles, alerts, setTripStatus } = useDemoStore();

  if (!hydrated) return <Skeleton className="h-96 w-full" />;

  const driver = drivers.find((d) => d.id === driverId);
  if (!driver) return null;

  const myTrips = trips
    .filter((t) => t.driverId === driverId)
    .sort((a, b) => a.time.localeCompare(b.time));
  const todayTrips = myTrips.filter(isToday);
  const activeTrip = myTrips.find((t) =>
    ["en_camino", "en_espera", "pasajero_abordado", "en_curso"].includes(t.status),
  );
  const nextTrip =
    activeTrip ?? myTrips.find((t) => ["asignado", "pendiente"].includes(t.status));
  const completedToday = todayTrips.filter((t) => t.status === "completado").length;
  const myVehicle = vehicles.find((v) => v.id === driver.assignedVehicleId);
  const myAlerts = alerts.filter((a) => a.vehicleId === driver.assignedVehicleId && a.status === "pendiente");

  const hour = 9; // hora simulada del DEMO
  const greeting = hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";

  const currentIndex = nextTrip ? DRIVER_STATUS_FLOW.indexOf(nextTrip.status) : -1;
  const nextStatus: TripStatus | null = nextTrip
    ? currentIndex >= 0 && currentIndex < DRIVER_STATUS_FLOW.length - 1
      ? DRIVER_STATUS_FLOW[currentIndex + 1]
      : nextTrip.status === "pendiente"
        ? "asignado"
        : null
    : null;

  const handlePrimaryAction = () => {
    if (!nextTrip || !nextStatus) return;
    if (STEPS_REQUIRING_DETAIL.includes(nextStatus)) {
      router.push(`/driver/active-trip?id=${nextTrip.id}`);
      return;
    }
    setTripStatus(nextTrip.id, nextStatus);
    toast.success(`Estado actualizado: ${TRIP_STATUS_LABELS[nextStatus]}`);
  };

  return (
    <div className="space-y-5">
      {/* 1. Estado actual del conductor */}
      <div>
        <p className="text-sm text-muted-foreground">{greeting},</p>
        <div className="flex items-center gap-2">
          <h1 className="font-heading text-xl font-bold">{driver.name.split(" ")[0]}</h1>
          <span aria-hidden>👋</span>
        </div>
        <div className="mt-1.5">
          <DriverStatusBadge status={driver.status} />
        </div>
      </div>

      {/* 2 y 3. Servicio activo/próximo + siguiente acción */}
      {nextTrip ? (
        <div>
          <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
            {activeTrip ? "Servicio en curso" : "Próximo servicio"}
          </h2>
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="font-heading text-lg font-bold">{nextTrip.folio}</span>
                <TripStatusBadge status={nextTrip.status} />
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {SERVICE_TYPE_LABELS[nextTrip.serviceType]} · {nextTrip.client}
              </p>

              <div className="mt-3 space-y-1.5 text-sm">
                <p className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0 text-success" /> {nextTrip.origin}</p>
                <p className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0 text-destructive" /> {nextTrip.destination}</p>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                <span>{formatDate(nextTrip.date, "dd MMM")} · {nextTrip.time} h</span>
                <span>{nextTrip.passengers} pax</span>
              </div>

              <div className="mt-3 space-y-2">
                {nextStatus ? (
                  <Button className="h-12 w-full text-base" onClick={handlePrimaryAction}>
                    {DRIVER_ACTION_LABELS[nextStatus] ?? `Marcar: ${TRIP_STATUS_LABELS[nextStatus]}`}
                    <ArrowRight />
                  </Button>
                ) : (
                  <div className="rounded-lg bg-success-soft p-3 text-center text-sm font-medium text-success">
                    Servicio {TRIP_STATUS_LABELS[nextTrip.status].toLowerCase()}.
                  </div>
                )}
                <Link
                  href={`/driver/active-trip?id=${nextTrip.id}`}
                  className="flex h-10 w-full items-center justify-center gap-1 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary"
                >
                  Ver detalle completo <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            No tienes servicios asignados por ahora.
          </CardContent>
        </Card>
      )}

      {/* 4. Unidad asignada (reducida, no compite con el servicio activo) */}
      <Card>
        <CardContent className="flex items-center gap-3 p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-info-soft text-info">
            <Car className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {myVehicle ? `${myVehicle.code} · ${myVehicle.brand} ${myVehicle.model}` : "Sin unidad asignada"}
            </p>
            {myVehicle && (
              <p className="text-xs text-muted-foreground">{myVehicle.plates} · {myVehicle.fuelLevel}% combustible</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 5. Alertas relevantes */}
      {myAlerts.length > 0 && (
        <Card className="border-warning/30 bg-warning-soft">
          <CardContent className="p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-warning">
              <AlertTriangle className="h-4 w-4" /> Alertas de tu unidad
            </p>
            <ul className="mt-2 space-y-1 text-xs text-warning/90">
              {myAlerts.slice(0, 3).map((a) => (
                <li key={a.id}>• {a.description}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Franja secundaria compacta: no es el contenido principal */}
      <div className="grid grid-cols-3 gap-2">
        <MiniStat icon={Clock} label="Hoy" value={todayTrips.length} />
        <MiniStat icon={CheckCircle2} label="Completados" value={completedToday} tone="success" />
        <MiniStat icon={AlertTriangle} label="Alertas" value={myAlerts.length} tone={myAlerts.length ? "danger" : "neutral"} />
      </div>

      {/* Servicios del día */}
      {todayTrips.length > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground">Servicios de hoy</h2>
            <Link href="/driver/services" className="text-xs font-medium text-primary">Ver todos</Link>
          </div>
          <div className="space-y-2">
            {todayTrips.map((t) => (
              <Link key={t.id} href={`/driver/active-trip?id=${t.id}`}>
                <Card className="transition-colors hover:bg-secondary">
                  <CardContent className="flex items-center gap-3 p-3">
                    <div className="flex h-9 w-12 shrink-0 flex-col items-center justify-center rounded-md bg-secondary text-xs font-semibold">
                      {t.time}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{t.destination}</p>
                      <p className="truncate text-xs text-muted-foreground">{t.client}</p>
                    </div>
                    <TripStatusBadge status={t.status} />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      <Link
        href="/driver/fuel"
        className="flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-dashed border-border py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary"
      >
        <Fuel className="h-4 w-4" /> Registrar carga de gasolina
      </Link>
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  tone = "primary",
}: {
  icon: typeof Clock;
  label: string;
  value: number;
  tone?: "primary" | "success" | "danger" | "neutral";
}) {
  const toneClass =
    tone === "success" ? "text-success" : tone === "danger" ? "text-destructive" : tone === "neutral" ? "text-muted-foreground" : "text-info";
  return (
    <Card>
      <CardContent className="flex flex-col items-center p-2.5">
        <Icon className={`h-4 w-4 ${toneClass}`} />
        <p className="mt-1 text-base font-bold">{value}</p>
        <p className="text-[10px] text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}
