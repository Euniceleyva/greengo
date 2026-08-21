"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reservationStep2Schema, type ReservationStep2Values } from "@/lib/schemas";
import { useReservationStore } from "@/stores/reservation-store";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";

export function Step2Details() {
  const draft = useReservationStore((s) => s.draft);
  const updateDraft = useReservationStore((s) => s.updateDraft);
  const setStep = useReservationStore((s) => s.setStep);

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
          <Input id="date" type="date" className="mt-1.5" {...register("date")} />
          {errors.date && <p className="mt-1.5 text-xs text-destructive">{errors.date.message}</p>}
        </div>
        <div>
          <Label htmlFor="time">Hora</Label>
          <Input id="time" type="time" className="mt-1.5" {...register("time")} />
          {errors.time && <p className="mt-1.5 text-xs text-destructive">{errors.time.message}</p>}
        </div>
        {draft.direction === "redondo" && (
          <>
            <div>
              <Label htmlFor="returnDate">Fecha de regreso</Label>
              <Input
                id="returnDate"
                type="date"
                min={draft.date || undefined}
                className="mt-1.5"
                {...register("returnDate", { required: "Selecciona la fecha de regreso" })}
              />
              {errors.returnDate && <p className="mt-1.5 text-xs text-destructive">{errors.returnDate.message}</p>}
            </div>
            <div>
              <Label htmlFor="returnTime">Hora de regreso</Label>
              <Input
                id="returnTime"
                type="time"
                className="mt-1.5"
                {...register("returnTime", { required: "Selecciona la hora de regreso" })}
              />
              {errors.returnTime && <p className="mt-1.5 text-xs text-destructive">{errors.returnTime.message}</p>}
            </div>
          </>
        )}
        <div>
          <Label htmlFor="passengers">Pasajeros</Label>
          <Input id="passengers" type="number" min={1} max={60} className="mt-1.5" {...register("passengers")} />
          {errors.passengers && <p className="mt-1.5 text-xs text-destructive">{errors.passengers.message}</p>}
        </div>
        <div>
          <Label htmlFor="bags">Maletas</Label>
          <Input id="bags" type="number" min={0} max={60} className="mt-1.5" {...register("bags")} />
          {errors.bags && <p className="mt-1.5 text-xs text-destructive">{errors.bags.message}</p>}
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
