"use client";

import { Star, Phone, Car, Route as RouteIcon, AlertTriangle, ShieldAlert, IdCard } from "lucide-react";
import { useDemoStore } from "@/stores/demo-store";
import { useHydrated } from "@/lib/hooks";
import { useActiveDriverId } from "@/lib/use-active-driver";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/misc";
import { Avatar } from "@/components/shared/avatar";
import { DriverStatusBadge } from "@/components/shared/badges";
import { formatNumber } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { vehicleLabel } from "@/lib/lookups";

export default function DriverProfilePage() {
  const hydrated = useHydrated();
  const driverId = useActiveDriverId();
  const { drivers, vehicles } = useDemoStore();

  if (!hydrated) return <Skeleton className="h-96 w-full" />;

  const driver = drivers.find((d) => d.id === driverId);
  if (!driver) return null;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-col items-center p-6 text-center">
          <Avatar name={driver.name} size="lg" />
          <h1 className="mt-3 text-lg font-bold">{driver.name}</h1>
          <p className="text-sm text-muted-foreground">{driver.phone}</p>
          <div className="mt-2">
            <DriverStatusBadge status={driver.status} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Metric icon={RouteIcon} label="Viajes completados" value={String(driver.completedTrips)} />
        <Metric icon={Star} label="Calificación" value={String(driver.rating)} />
        <Metric icon={RouteIcon} label="Km conducidos" value={formatNumber(driver.drivenKm)} />
        <Metric icon={AlertTriangle} label="Incidencias" value={String(driver.incidents)} />
      </div>

      <Card>
        <CardContent className="space-y-2 p-4 text-sm">
          <Row icon={IdCard} label="Licencia" value={driver.licenseNumber} />
          <Row label="Vigencia" value={formatDate(driver.licenseExpiresOn, "dd MMM yyyy")} />
          <Row icon={Car} label="Unidad asignada" value={vehicleLabel(vehicles, driver.assignedVehicleId)} />
          <Row icon={ShieldAlert} label="Contacto de emergencia" value={driver.emergencyContact} />
          <Row icon={Phone} label="Tel. emergencia" value={driver.emergencyPhone} />
        </CardContent>
      </Card>

      <p className="px-2 text-center text-xs text-muted-foreground">
        Perfil simulado del DEMO. Los datos no corresponden a una persona real.
      </p>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Star;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center p-4 text-center">
        <Icon className="h-5 w-5 text-primary" />
        <p className="mt-1 text-xl font-bold">{value}</p>
        <p className="text-[11px] text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon?: typeof Star;
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
