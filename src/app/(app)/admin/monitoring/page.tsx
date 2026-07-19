"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Play, Pause, SkipForward, Gauge, Fuel, Clock, Navigation } from "lucide-react";
import { useDemoStore } from "@/stores/demo-store";
import { useHydrated } from "@/lib/hooks";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/misc";
import { MapView, type MapMarker, type MapRoute } from "@/components/maps/map-view";
import { VehicleStatusBadge } from "@/components/shared/badges";
import { VEHICLE_STATUS_COLOR, VEHICLE_STATUS_LABELS } from "@/constants";
import { MOCK_ROUTES } from "@/mocks/locations";
import { interpolateRoute } from "@/lib/geo";
import { formatNumber } from "@/lib/utils";
import { driverName } from "@/lib/lookups";
import type { VehicleStatus } from "@/types";

// Ruta de simulación (mock) para mover una unidad localmente.
const SIM_PATH = interpolateRoute(MOCK_ROUTES["aeropuerto-zona-hotelera"], 8);

export default function MonitoringPage() {
  const hydrated = useHydrated();
  const { vehicles, drivers, trips, updateVehicle } = useDemoStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [simVehicleId, setSimVehicleId] = useState<string>("veh-01");
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const advance = useMemo(
    () => (n: number) => {
      const next = (n + 1) % SIM_PATH.length;
      updateVehicle(simVehicleId, {
        lastLocation: SIM_PATH[next],
        status: "en_ruta",
        speedKmh: 40 + Math.round(Math.random() * 40),
        lastLocationName: "En recorrido (simulación)",
      });
      return next;
    },
    [simVehicleId, updateVehicle],
  );

  useEffect(() => {
    if (running) {
      timer.current = setInterval(() => setStep((s) => advance(s)), 1200);
    } else if (timer.current) {
      clearInterval(timer.current);
    }
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [running, advance]);

  if (!hydrated) return <Skeleton className="h-96 w-full" />;

  const selected = vehicles.find((v) => v.id === selectedId) ?? null;
  const activeTrip = selected
    ? trips.find((t) => t.vehicleId === selected.id && ["en_curso", "en_camino", "en_espera", "pasajero_abordado"].includes(t.status))
    : null;

  const markers: MapMarker[] = vehicles.map((v) => ({
    id: v.id,
    position: v.lastLocation,
    color: VEHICLE_STATUS_COLOR[v.status],
    title: v.code,
    popup: (
      <div className="text-xs">
        <p className="font-semibold">{v.code} · {v.plates}</p>
        <p>{VEHICLE_STATUS_LABELS[v.status]} · {v.speedKmh} km/h</p>
      </div>
    ),
  }));

  const routes: MapRoute[] = running || step > 0 ? [{ points: SIM_PATH, color: "#0369a1" }] : [];

  const statusCounts = (Object.keys(VEHICLE_STATUS_LABELS) as VehicleStatus[]).map((s) => ({
    status: s,
    count: vehicles.filter((v) => v.status === s).length,
  }));

  return (
    <div>
      <PageHeader
        title="Monitoreo en tiempo real"
        description="Ubicación simulada de la flota. Los datos GPS reales se integrarían en producción."
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Monitoreo" }]}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {statusCounts.map((s) => (
          <span
            key={s.status}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs"
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: VEHICLE_STATUS_COLOR[s.status] }} />
            {VEHICLE_STATUS_LABELS[s.status]}: <strong>{s.count}</strong>
          </span>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-3">
            <div className="h-[26rem] overflow-hidden rounded-lg">
              <MapView markers={markers} routes={routes} zoom={11} selectedId={selectedId} />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {/* Simulación de movimiento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-4 w-4" /> Simulación de movimiento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Mueve una unidad sobre una ruta mock. No usa conexiones externas ni tiempo real.
              </p>
              <select
                className="h-9 w-full rounded-md border border-input bg-card px-2 text-sm"
                value={simVehicleId}
                onChange={(e) => setSimVehicleId(e.target.value)}
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>{v.code} · {v.plates}</option>
                ))}
              </select>
              <div className="flex gap-2">
                {running ? (
                  <Button variant="secondary" size="sm" className="flex-1" onClick={() => setRunning(false)}>
                    <Pause /> Pausar
                  </Button>
                ) : (
                  <Button size="sm" className="flex-1" onClick={() => setRunning(true)}>
                    <Play /> Iniciar
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setStep((s) => advance(s))}
                >
                  <SkipForward /> Avanzar
                </Button>
              </div>
              <p className="text-center text-xs text-muted-foreground">
                Paso {step + 1} / {SIM_PATH.length}
              </p>
            </CardContent>
          </Card>

          {/* Detalle de unidad seleccionada */}
          <Card>
            <CardHeader>
              <CardTitle>Detalle de unidad</CardTitle>
            </CardHeader>
            <CardContent>
              {!selected ? (
                <p className="text-sm text-muted-foreground">
                  Selecciona una unidad de la lista para ver su detalle.
                </p>
              ) : (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{selected.code} · {selected.plates}</span>
                    <VehicleStatusBadge status={selected.status} />
                  </div>
                  <DetailRow label="Conductor" value={driverName(drivers, selected.assignedDriverId)} />
                  <DetailRow icon={Gauge} label="Velocidad" value={`${selected.speedKmh} km/h`} />
                  <DetailRow icon={Fuel} label="Combustible" value={`${selected.fuelLevel}%`} />
                  <DetailRow label="Km del día" value={`${formatNumber(selected.odometerKm % 500)} km`} />
                  <DetailRow icon={Clock} label="Última actualización" value="hace instantes" />
                  <DetailRow label="Ubicación" value={selected.lastLocationName} />
                  <DetailRow label="Servicio activo" value={activeTrip ? activeTrip.folio : "Ninguno"} />
                  {activeTrip && (
                    <Link
                      href={`/admin/trips/${activeTrip.id}`}
                      className="mt-2 inline-block text-xs font-medium text-primary hover:underline"
                    >
                      Ver comparación de ruta →
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Unidades</CardTitle>
            </CardHeader>
            <CardContent className="max-h-64 space-y-1 overflow-y-auto">
              {vehicles.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedId(v.id)}
                  className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-secondary ${selectedId === v.id ? "bg-secondary" : ""}`}
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: VEHICLE_STATUS_COLOR[v.status] }} />
                  <span className="font-medium">{v.code}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{v.speedKmh} km/h</span>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon?: typeof Gauge;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-1.5 text-muted-foreground">
        {Icon && <Icon className="h-3.5 w-3.5" />} {label}
      </span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
