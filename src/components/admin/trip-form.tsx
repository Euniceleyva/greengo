"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tripSchema, type TripFormValues } from "@/lib/schemas";
import { useDemoStore } from "@/stores/demo-store";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select, Label } from "@/components/ui/input";
import { SERVICE_TYPE_LABELS } from "@/constants";
import type { BookingSource, PaymentStatus, ServiceType, Trip, TripDirection } from "@/types";

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

const SOURCE_LABELS: Record<BookingSource, string> = {
  web: "Reserva web",
  admin: "Captura admin",
  whatsapp: "WhatsApp",
  agencia: "Agencia",
};

const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  pendiente: "Pendiente",
  parcial: "Parcial",
  pagado: "Pagado",
  cotizacion: "Cotización",
};

const DIRECTION_LABELS: Record<TripDirection, string> = {
  sencillo: "Sencillo",
  redondo: "Redondo",
};

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
          direction: initial.direction ?? "sencillo",
          bookingSource: initial.bookingSource ?? "admin",
          client: initial.client,
          contactPhone: initial.contactPhone ?? "",
          contactEmail: initial.contactEmail ?? "",
          passengers: initial.passengers,
          bags: initial.bags ?? initial.passengers + 1,
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
          paymentStatus: initial.paymentStatus ?? "pendiente",
        }
      : {
          serviceType: "aeropuerto",
          direction: "sencillo",
          bookingSource: "admin",
          client: "",
          contactPhone: "",
          contactEmail: "",
          passengers: 1,
          bags: 2,
          origin: "",
          destination: "",
          date: "2026-07-12",
          time: "09:00",
          amount: 0,
          driverId: null,
          vehicleId: null,
          paymentStatus: "pendiente",
        },
  });

  const serviceType = watch("serviceType");
  const isAirport = serviceType === "aeropuerto";
  const isOpen = serviceType === "transporte_abierto";
  const isCustom = serviceType === "a_medida";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Tipo de traslado">
          <Select {...register("serviceType")}>
            {SERVICE_TYPES.map((t) => (
              <option key={t} value={t}>
                {SERVICE_TYPE_LABELS[t]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Sentido">
          <Select {...register("direction")}>
            {(Object.keys(DIRECTION_LABELS) as TripDirection[]).map((direction) => (
              <option key={direction} value={direction}>
                {DIRECTION_LABELS[direction]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Origen de reserva">
          <Select {...register("bookingSource")}>
            {(Object.keys(SOURCE_LABELS) as BookingSource[]).map((source) => (
              <option key={source} value={source}>
                {SOURCE_LABELS[source]}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Cliente" error={errors.client?.message}>
          <Input {...register("client")} placeholder="Nombre o agencia" />
        </Field>
        <Field label="Teléfono del pasajero">
          <Input {...register("contactPhone")} placeholder="9985550100" />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Correo">
          <Input type="email" {...register("contactEmail")} placeholder="cliente@email.com" />
        </Field>
        <Field label="Pasajeros" error={errors.passengers?.message}>
          <Input type="number" min={1} {...register("passengers")} />
        </Field>
        <Field label="Equipaje" error={errors.bags?.message}>
          <Input type="number" min={0} {...register("bags")} />
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

      <div className="grid gap-4 sm:grid-cols-4">
        <Field label="Fecha" error={errors.date?.message}>
          <Input type="date" {...register("date")} />
        </Field>
        <Field label="Hora" error={errors.time?.message}>
          <Input type="time" {...register("time")} />
        </Field>
        <Field label="Tarifa (MXN)" error={errors.amount?.message}>
          <Input type="number" min={0} step={10} {...register("amount")} />
        </Field>
        <Field label="Pago">
          <Select {...register("paymentStatus")}>
            {(Object.keys(PAYMENT_LABELS) as PaymentStatus[]).map((status) => (
              <option key={status} value={status}>
                {PAYMENT_LABELS[status]}
              </option>
            ))}
          </Select>
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
