"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tripSchema, type TripFormValues } from "@/lib/schemas";
import { useDemoStore } from "@/stores/demo-store";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select, Label } from "@/components/ui/input";
import { SERVICE_TYPE_LABELS } from "@/constants";
import type { ServiceType, Trip } from "@/types";

interface TripFormProps {
  initial?: Trip;
  onSubmit: (values: TripFormValues) => void;
  onCancel: () => void;
}

const SERVICE_TYPES: ServiceType[] = [
  "hotel_hotel",
  "aeropuerto",
  "transporte_abierto",
  "a_medida",
];

export function TripForm({ initial, onSubmit, onCancel }: TripFormProps) {
  const vehicles = useDemoStore((s) => s.vehicles);
  const drivers = useDemoStore((s) => s.drivers);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TripFormValues>({
    resolver: zodResolver(tripSchema),
    defaultValues: initial
      ? {
          serviceType: initial.serviceType,
          client: initial.client,
          passengers: initial.passengers,
          origin: initial.origin,
          destination: initial.destination,
          date: initial.date,
          time: initial.time,
          amount: initial.amount,
          driverId: initial.driverId,
          vehicleId: initial.vehicleId,
          flightNumber: initial.flightNumber,
          airline: initial.airline,
          hotel: initial.hotel,
          durationHours: initial.durationHours,
          specialInstructions: initial.specialInstructions,
          specialReception: initial.specialReception,
          discount: initial.discount,
        }
      : {
          serviceType: "aeropuerto",
          client: "",
          passengers: 1,
          origin: "",
          destination: "",
          date: "2026-07-12",
          time: "09:00",
          amount: 0,
          driverId: null,
          vehicleId: null,
        },
  });

  const serviceType = watch("serviceType");
  const isAirport = serviceType === "aeropuerto";
  const isOpen = serviceType === "transporte_abierto";
  const isCustom = serviceType === "a_medida";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label>Tipo de traslado</Label>
        <Select {...register("serviceType")} className="mt-1">
          {SERVICE_TYPES.map((t) => (
            <option key={t} value={t}>
              {SERVICE_TYPE_LABELS[t]}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Cliente" error={errors.client?.message}>
          <Input {...register("client")} placeholder="Nombre o agencia" />
        </Field>
        <Field label="Número de pasajeros" error={errors.passengers?.message}>
          <Input type="number" min={1} {...register("passengers")} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Origen" error={errors.origin?.message}>
          <Input {...register("origin")} placeholder="Punto de partida" />
        </Field>
        <Field label="Destino" error={errors.destination?.message}>
          <Input {...register("destination")} placeholder="Punto de llegada" />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Fecha" error={errors.date?.message}>
          <Input type="date" {...register("date")} />
        </Field>
        <Field label="Hora" error={errors.time?.message}>
          <Input type="time" {...register("time")} />
        </Field>
        <Field label="Tarifa (MXN)" error={errors.amount?.message}>
          <Input type="number" min={0} step={10} {...register("amount")} />
        </Field>
      </div>

      {isAirport && (
        <div className="grid gap-4 rounded-lg bg-secondary/60 p-3 sm:grid-cols-3">
          <Field label="Número de vuelo">
            <Input {...register("flightNumber")} placeholder="AM-482" />
          </Field>
          <Field label="Aerolínea">
            <Input {...register("airline")} placeholder="Aeroméxico" />
          </Field>
          <Field label="Hotel">
            <Input {...register("hotel")} placeholder="Hotel destino" />
          </Field>
        </div>
      )}

      {isOpen && (
        <div className="rounded-lg bg-secondary/60 p-3">
          <Field label="Duración (horas)" error={errors.durationHours?.message}>
            <Input type="number" min={1} {...register("durationHours")} placeholder="6" />
          </Field>
        </div>
      )}

      {isCustom && (
        <div className="grid gap-4 rounded-lg bg-secondary/60 p-3 sm:grid-cols-2">
          <Field label="Descuento (%)" error={errors.discount?.message}>
            <Input type="number" min={0} max={100} {...register("discount")} placeholder="10" />
          </Field>
          <label className="flex items-center gap-2 pt-6 text-sm">
            <input type="checkbox" {...register("specialReception")} className="h-4 w-4" />
            Recepción personalizada
          </label>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Conductor">
          <Select {...register("driverId")}>
            <option value="">Sin asignar</option>
            {drivers
              .filter((d) => d.status !== "inactivo")
              .map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
          </Select>
        </Field>
        <Field label="Vehículo">
          <Select {...register("vehicleId")}>
            <option value="">Sin asignar</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.code} · {v.plates}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Instrucciones especiales">
        <Textarea {...register("specialInstructions")} placeholder="Notas para el conductor…" />
      </Field>

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">{initial ? "Guardar cambios" : "Crear servicio"}</Button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="mb-1 block">{label}</Label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
