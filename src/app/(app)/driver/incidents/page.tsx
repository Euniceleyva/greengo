"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle } from "lucide-react";
import { useDemoStore } from "@/stores/demo-store";
import { useHydrated } from "@/lib/hooks";
import { useActiveDriverId } from "@/lib/use-active-driver";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, Textarea, Label } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/misc";
import { PhotoInput } from "@/components/driver/photo-input";
import { toast } from "@/components/ui/toast";
import { incidentSchema, type IncidentFormValues } from "@/lib/schemas";
import { INCIDENT_TYPE_LABELS } from "@/constants";
import type { IncidentType } from "@/types";
import { formatDate } from "@/lib/format";

export default function DriverIncidentsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <IncidentsContent />
    </Suspense>
  );
}

function IncidentsContent() {
  const params = useSearchParams();
  const router = useRouter();
  const hydrated = useHydrated();
  const driverId = useActiveDriverId();
  const { trips, drivers, incidents, addIncident } = useDemoStore();

  const tripParam = params.get("trip");
  const driver = drivers.find((d) => d.id === driverId);
  const myTrips = trips.filter((t) => t.driverId === driverId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IncidentFormValues>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      type: "retraso",
      tripId: tripParam ?? null,
      description: "",
    },
  });

  if (!hydrated) return <Skeleton className="h-96 w-full" />;

  const myIncidents = incidents.filter((i) => i.driverId === driverId).slice(0, 4);

  const onSubmit = (values: IncidentFormValues) => {
    const relatedTrip = trips.find((t) => t.id === values.tripId);
    addIncident({
      type: values.type,
      tripId: values.tripId || null,
      driverId,
      vehicleId: relatedTrip?.vehicleId ?? driver?.assignedVehicleId ?? null,
      description: values.description,
      hasEvidence: true,
    });
    toast.success("Incidencia reportada. El administrador la verá reflejada.");
    reset({ type: "retraso", tripId: null, description: "" });
    if (tripParam) router.push("/driver/services");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-destructive" />
        <h1 className="text-xl font-bold">Reportar incidencia</h1>
      </div>

      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div>
              <Label className="mb-1 block">Tipo de incidencia</Label>
              <Select {...register("type")}>
                {(Object.keys(INCIDENT_TYPE_LABELS) as IncidentType[]).map((t) => (
                  <option key={t} value={t}>{INCIDENT_TYPE_LABELS[t]}</option>
                ))}
              </Select>
            </div>

            <div>
              <Label className="mb-1 block">Servicio relacionado</Label>
              <Select {...register("tripId")}>
                <option value="">Sin servicio específico</option>
                {myTrips.map((t) => (
                  <option key={t.id} value={t.id}>{t.folio} · {t.destination}</option>
                ))}
              </Select>
            </div>

            <div>
              <Label className="mb-1 block">Descripción</Label>
              <Textarea {...register("description")} placeholder="Describe qué ocurrió…" rows={4} />
              {errors.description && <p className="mt-1 text-xs text-destructive">{errors.description.message}</p>}
            </div>

            <div>
              <Label className="mb-1 block">Evidencia (foto)</Label>
              <PhotoInput label="Adjuntar evidencia" />
            </div>

            <Button type="submit" variant="destructive" className="h-11 w-full">
              Enviar reporte
            </Button>
          </form>
        </CardContent>
      </Card>

      {myIncidents.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold text-muted-foreground">Mis reportes recientes</h2>
          <div className="space-y-2">
            {myIncidents.map((i) => (
              <Card key={i.id}>
                <CardContent className="p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{INCIDENT_TYPE_LABELS[i.type]}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(i.createdAt, "dd MMM")}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{i.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
