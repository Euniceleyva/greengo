"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Users, Car } from "lucide-react";
import { useDemoStore } from "@/stores/demo-store";
import { useHydrated } from "@/lib/hooks";
import { useActiveDriverId } from "@/lib/use-active-driver";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/misc";
import { EmptyState } from "@/components/shared/states";
import { TripStatusBadge } from "@/components/shared/badges";
import { SERVICE_TYPE_LABELS } from "@/constants";
import { vehicleLabel } from "@/lib/lookups";
import { formatDate } from "@/lib/format";
import type { Trip, TripStatus } from "@/types";

type Tab = "proximos" | "en_curso" | "completados" | "cancelados";

const TAB_STATUSES: Record<Tab, TripStatus[]> = {
  proximos: ["pendiente", "asignado"],
  en_curso: ["en_camino", "en_espera", "pasajero_abordado", "en_curso"],
  completados: ["completado"],
  cancelados: ["cancelado", "con_incidencia"],
};

const TAB_LABELS: Record<Tab, string> = {
  proximos: "Próximos",
  en_curso: "En curso",
  completados: "Completados",
  cancelados: "Cancelados",
};

export default function DriverServicesPage() {
  const hydrated = useHydrated();
  const driverId = useActiveDriverId();
  const { trips, vehicles } = useDemoStore();
  const [tab, setTab] = useState<Tab>("proximos");

  if (!hydrated) return <Skeleton className="h-96 w-full" />;

  const myTrips = trips.filter((t) => t.driverId === driverId);
  const filtered = myTrips
    .filter((t) => TAB_STATUSES[tab].includes(t.status))
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));

  return (
    <div>
      <h1 className="mb-3 text-xl font-bold">Mis servicios</h1>

      <div className="mb-4 flex gap-1 overflow-x-auto rounded-lg border border-border bg-card p-1">
        {(Object.keys(TAB_LABELS) as Tab[]).map((t) => {
          const count = myTrips.filter((tr) => TAB_STATUSES[t].includes(tr.status)).length;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {TAB_LABELS[t]} ({count})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Sin servicios" description="No hay servicios en esta categoría." />
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => (
            <ServiceCard key={t.id} trip={t} vehicleText={vehicleLabel(vehicles, t.vehicleId)} />
          ))}
        </div>
      )}
    </div>
  );
}

function ServiceCard({ trip, vehicleText }: { trip: Trip; vehicleText: string }) {
  return (
    <Link href={`/driver/active-trip?id=${trip.id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-secondary px-2 py-1 text-sm font-bold">{trip.time}</span>
              <span className="text-xs text-muted-foreground">{SERVICE_TYPE_LABELS[trip.serviceType]}</span>
            </div>
            <TripStatusBadge status={trip.status} />
          </div>
          <div className="mt-3 space-y-1.5 text-sm">
            <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-emerald-600" /> {trip.origin}</p>
            <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-red-600" /> {trip.destination}</p>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-border pt-2 text-xs text-muted-foreground">
            <span>{formatDate(trip.date, "dd MMM")}</span>
            <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {trip.passengers} pax</span>
            <span className="flex items-center gap-1"><Car className="h-3 w-3" /> {vehicleText}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
