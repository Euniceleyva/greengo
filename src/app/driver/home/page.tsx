"use client";

import Link from "next/link";
import { Car, Clock, MapPin, ArrowRight, AlertTriangle, CheckCircle2, Fuel } from "lucide-react";
import { useDemoStore } from "@/stores/demo-store";
import { useHydrated } from "@/lib/hooks";
import { useActiveDriverId } from "@/lib/use-active-driver";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/misc";
import { TripStatusBadge } from "@/components/shared/badges";
import { DriverStatusBadge } from "@/components/shared/badges";
import { SERVICE_TYPE_LABELS } from "@/constants";
import { isToday } from "@/lib/lookups";
import { formatDate } from "@/lib/format";

export default function DriverHomePage() {
  const hydrated = useHydrated();
  const driverId = useActiveDriverId();
  const { drivers, trips, vehicles, alerts } = useDemoStore();

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

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">{greeting},</p>
        <h1 className="text-xl font-bold">{driver.name.split(" ")[0]} 👋</h1>
        <div className="mt-1">
          <DriverStatusBadge status={driver.status} />
        </div>
      </div>

      {/* Unidad asignada */}
      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
            <Car className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Unidad asignada</p>
            <p className="font-semibold">{myVehicle ? `${myVehicle.code} · ${myVehicle.brand} ${myVehicle.model}` : "Sin unidad"}</p>
            {myVehicle && <p className="text-xs text-muted-foreground">{myVehicle.plates} · {myVehicle.fuelLevel}% combustible</p>}
          </div>
        </CardContent>
      </Card>

      {/* Resumen del día */}
      <div className="grid grid-cols-3 gap-2">
        <MiniStat icon={Clock} label="Hoy" value={todayTrips.length} />
        <MiniStat icon={CheckCircle2} label="Completados" value={completedToday} tone="success" />
        <MiniStat icon={AlertTriangle} label="Alertas" value={myAlerts.length} tone={myAlerts.length ? "danger" : "neutral"} />
      </div>

      {/* Próximo servicio */}
      {nextTrip ? (
        <div>
          <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
            {activeTrip ? "Servicio en curso" : "Próximo servicio"}
          </h2>
          <Link href={`/driver/active-trip?id=${nextTrip.id}`}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{nextTrip.folio}</span>
                  <TripStatusBadge status={nextTrip.status} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{SERVICE_TYPE_LABELS[nextTrip.serviceType]}</p>
                <div className="mt-3 space-y-1.5 text-sm">
                  <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-emerald-600" /> {nextTrip.origin}</p>
                  <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-red-600" /> {nextTrip.destination}</p>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                  <span className="text-xs text-muted-foreground">
                    {formatDate(nextTrip.date, "dd MMM")} · {nextTrip.time} h · {nextTrip.passengers} pax
                  </span>
                  <span className="flex items-center gap-1 text-sm font-medium text-primary">
                    Ver <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            No tienes servicios asignados por ahora.
          </CardContent>
        </Card>
      )}

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

      {/* Alertas importantes */}
      {myAlerts.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/60">
          <CardContent className="p-4">
            <p className="flex items-center gap-2 text-sm font-medium text-amber-800">
              <AlertTriangle className="h-4 w-4" /> Alertas de tu unidad
            </p>
            <ul className="mt-2 space-y-1 text-xs text-amber-700">
              {myAlerts.slice(0, 3).map((a) => (
                <li key={a.id}>• {a.description}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Link
        href="/driver/fuel"
        className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border py-3 text-sm font-medium text-muted-foreground hover:bg-secondary"
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
    tone === "success" ? "text-emerald-600" : tone === "danger" ? "text-red-600" : tone === "neutral" ? "text-muted-foreground" : "text-sky-600";
  return (
    <Card>
      <CardContent className="flex flex-col items-center p-3">
        <Icon className={`h-5 w-5 ${toneClass}`} />
        <p className="mt-1 text-lg font-bold">{value}</p>
        <p className="text-[10px] text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}
