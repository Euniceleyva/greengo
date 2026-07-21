"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reservationStep2Schema, type ReservationStep2Values } from "@/lib/schemas";
import { useReservationStore } from "@/stores/reservation-store";
import { Button, Input, Textarea, Label, FieldError } from "@/components/landing/ui/public-controls";

export function Step2Details() {
  const draft = useReservationStore((s) => s.draft);
  const updateDraft = useReservationStore((s) => s.updateDraft);
  const setStep = useReservationStore((s) => s.setStep);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReservationStep2Values>({
    resolver: zodResolver(reservationStep2Schema),
    defaultValues: {
      date: draft.date,
      time: draft.time,
      passengers: draft.passengers,
      bags: draft.bags,
      flightNumber: draft.flightNumber,
      notes: draft.notes,
    },
  });

  const onSubmit = (data: ReservationStep2Values) => {
    updateDraft({
      ...data,
      flightNumber: data.flightNumber ?? "",
      notes: data.notes ?? "",
    });
    setStep(3);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="date">Fecha</Label>
          <Input id="date" type="date" className="mt-1.5" {...register("date")} />
          <FieldError>{errors.date?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="time">Hora</Label>
          <Input id="time" type="time" className="mt-1.5" {...register("time")} />
          <FieldError>{errors.time?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="passengers">Pasajeros</Label>
          <Input id="passengers" type="number" min={1} max={60} className="mt-1.5" {...register("passengers")} />
          <FieldError>{errors.passengers?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="bags">Maletas</Label>
          <Input id="bags" type="number" min={0} max={60} className="mt-1.5" {...register("bags")} />
          <FieldError>{errors.bags?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="flightNumber">Número de vuelo (opcional)</Label>
          <Input id="flightNumber" placeholder="Ej. AM-482" className="mt-1.5" {...register("flightNumber")} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="notes">Notas (opcional)</Label>
          <Textarea
            id="notes"
            className="mt-1.5"
            placeholder="Silla para bebé, equipaje especial, etc."
            {...register("notes")}
          />
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <Button type="button" variant="outline" onClick={() => setStep(1)}>
          Atrás
        </Button>
        <Button type="submit">Continuar</Button>
      </div>
    </form>
  );
}
