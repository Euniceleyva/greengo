"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reservationStep1Schema, type ReservationStep1Values } from "@/lib/schemas";
import { useReservationStore } from "@/stores/reservation-store";
import { LOCATIONS } from "@/mocks/locations";
import { SERVICE_TYPE_LABELS } from "@/constants";
import { Button } from "@/components/ui/button";
import { Select, Label } from "@/components/ui/input";
import type { ServiceType } from "@/types";

const SERVICE_TYPES = Object.keys(SERVICE_TYPE_LABELS) as ServiceType[];

export function Step1Service() {
  const draft = useReservationStore((s) => s.draft);
  const updateDraft = useReservationStore((s) => s.updateDraft);
  const setStep = useReservationStore((s) => s.setStep);
  const clearConfirmedFolio = useReservationStore((s) => s.clearConfirmedFolio);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReservationStep1Values>({
    resolver: zodResolver(reservationStep1Schema),
    defaultValues: {
      serviceType: draft.serviceType ?? "aeropuerto",
      originLocationId: draft.originLocationId ?? LOCATIONS[0].id,
      destinationLocationId: draft.destinationLocationId ?? LOCATIONS[1].id,
      direction: draft.direction,
    },
  });

  const onSubmit = (data: ReservationStep1Values) => {
    updateDraft(data);
    clearConfirmedFolio();
    setStep(2);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="serviceType">Tipo de servicio</Label>
          <Select id="serviceType" className="mt-1.5" {...register("serviceType")}>
            {SERVICE_TYPES.map((type) => (
              <option key={type} value={type}>
                {SERVICE_TYPE_LABELS[type]}
              </option>
            ))}
          </Select>
          {errors.serviceType && (
            <p className="mt-1.5 text-xs text-destructive">{errors.serviceType.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="originLocationId">Origen</Label>
          <Select id="originLocationId" className="mt-1.5" {...register("originLocationId")}>
            {LOCATIONS.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </Select>
          {errors.originLocationId && (
            <p className="mt-1.5 text-xs text-destructive">{errors.originLocationId.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="destinationLocationId">Destino</Label>
          <Select id="destinationLocationId" className="mt-1.5" {...register("destinationLocationId")}>
            {LOCATIONS.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </Select>
          {errors.destinationLocationId && (
            <p className="mt-1.5 text-xs text-destructive">{errors.destinationLocationId.message}</p>
          )}
        </div>

        <fieldset className="sm:col-span-2">
          <legend className="text-sm font-medium text-foreground">Sentido</legend>
          <div className="mt-1.5 flex gap-4">
            <label className="flex min-h-[44px] items-center gap-2 text-sm text-foreground">
              <input type="radio" value="sencillo" className="h-4 w-4" {...register("direction")} />
              Sencillo
            </label>
            <label className="flex min-h-[44px] items-center gap-2 text-sm text-foreground">
              <input type="radio" value="redondo" className="h-4 w-4" {...register("direction")} />
              Redondo
            </label>
          </div>
        </fieldset>
      </div>

      <div className="mt-8 flex justify-end">
        <Button type="submit">Continuar</Button>
      </div>
    </form>
  );
}
