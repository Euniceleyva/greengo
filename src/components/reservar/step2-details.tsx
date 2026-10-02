"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reservationStep2Schema, type ReservationStep2Values } from "@/lib/schemas";
import { useReservationStore } from "@/stores/reservation-store";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { getCancunToday } from "@/lib/public-fares";

export function Step2Details() {
  const draft = useReservationStore((s) => s.draft);
  const updateDraft = useReservationStore((s) => s.updateDraft);
  const setStep = useReservationStore((s) => s.setStep);
  const today = React.useMemo(() => getCancunToday(), []);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ReservationStep2Values>({
    resolver: zodResolver(reservationStep2Schema),
    defaultValues: {
      date: draft.date,
      time: draft.time,
      returnDate: draft.returnDate,
      returnTime: draft.returnTime,
      passengers: draft.passengers,
      bags: draft.bags,
      flightNumber: draft.flightNumber,
      notes: draft.notes,
    },
  });

  const onSubmit = (data: ReservationStep2Values) => {
    if (draft.direction === "redondo") {
      if (!data.returnDate) setError("returnDate", { message: "Selecciona la fecha de regreso" });
      if (!data.returnTime) setError("returnTime", { message: "Selecciona la hora de regreso" });
      if (!data.returnDate || !data.returnTime) return;
      if (data.returnDate < data.date) {
        setError("returnDate", { message: "El regreso no puede ser anterior a la salida" });
        return;
      }
      if (data.returnDate === data.date && data.returnTime <= data.time) {
        setError("returnTime", { message: "Si regresas el mismo día, la hora de regreso debe ser posterior a la salida" });
        return;
      }
    }
    updateDraft({
      ...data,
      returnDate: data.returnDate ?? "",
      returnTime: data.returnTime ?? "",
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
          <Input id="date" type="date" min={today} className="mt-1.5" aria-invalid={Boolean(errors.date)} aria-describedby={errors.date ? "date-error" : undefined} {...register("date")} />
          {errors.date && <p id="date-error" role="alert" className="mt-1.5 text-xs text-destructive">{errors.date.message}</p>}
        </div>
        <div>
          <Label htmlFor="time">Hora</Label>
          <Input id="time" type="time" className="mt-1.5" aria-invalid={Boolean(errors.time)} aria-describedby={errors.time ? "time-error" : undefined} {...register("time")} />
          {errors.time && <p id="time-error" role="alert" className="mt-1.5 text-xs text-destructive">{errors.time.message}</p>}
        </div>
        {draft.direction === "redondo" && (
          <>
            <div>
              <Label htmlFor="returnDate">Fecha de regreso</Label>
              <Input
                id="returnDate"
                type="date"
                min={draft.date || today}
                className="mt-1.5"
                aria-invalid={Boolean(errors.returnDate)}
                aria-describedby={errors.returnDate ? "returnDate-error" : undefined}
                {...register("returnDate", { required: "Selecciona la fecha de regreso" })}
              />
              {errors.returnDate && <p id="returnDate-error" role="alert" className="mt-1.5 text-xs text-destructive">{errors.returnDate.message}</p>}
            </div>
            <div>
              <Label htmlFor="returnTime">Hora de regreso</Label>
              <Input
                id="returnTime"
                type="time"
                className="mt-1.5"
                aria-invalid={Boolean(errors.returnTime)}
                aria-describedby={errors.returnTime ? "returnTime-error" : undefined}
                {...register("returnTime", { required: "Selecciona la hora de regreso" })}
              />
              {errors.returnTime && <p id="returnTime-error" role="alert" className="mt-1.5 text-xs text-destructive">{errors.returnTime.message}</p>}
            </div>
          </>
        )}
        <div>
          <Label htmlFor="passengers">Pasajeros</Label>
          <Input id="passengers" type="number" min={1} max={60} className="mt-1.5" {...register("passengers")} />
          {errors.passengers && <p role="alert" className="mt-1.5 text-xs text-destructive">{errors.passengers.message}</p>}
        </div>
        <div>
          <Label htmlFor="bags">Maletas</Label>
          <Input id="bags" type="number" min={0} max={60} className="mt-1.5" {...register("bags")} />
          {errors.bags && <p role="alert" className="mt-1.5 text-xs text-destructive">{errors.bags.message}</p>}
        </div>
        <div>
          <Label htmlFor="flightNumber">Número de vuelo (opcional)</Label>
          <Input id="flightNumber" maxLength={30} placeholder="Ej. AM-482" className="mt-1.5" {...register("flightNumber")} />
          {errors.flightNumber && <p role="alert" className="mt-1.5 text-xs text-destructive">{errors.flightNumber.message}</p>}
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="notes">Notas (opcional)</Label>
          <Textarea
            id="notes"
            maxLength={1000}
            className="mt-1.5"
            placeholder="Silla para bebé, equipaje especial, etc."
            {...register("notes")}
          />
          {errors.notes && <p role="alert" className="mt-1.5 text-xs text-destructive">{errors.notes.message}</p>}
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
