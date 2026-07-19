"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reservationStep3Schema, type ReservationStep3Values } from "@/lib/schemas";
import { useReservationStore } from "@/stores/reservation-store";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function Step3Contact() {
  const draft = useReservationStore((s) => s.draft);
  const updateDraft = useReservationStore((s) => s.updateDraft);
  const setStep = useReservationStore((s) => s.setStep);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReservationStep3Values>({
    resolver: zodResolver(reservationStep3Schema),
    defaultValues: {
      contactName: draft.contactName,
      contactEmail: draft.contactEmail,
      contactPhone: draft.contactPhone,
      hotel: draft.hotel,
    },
  });

  const onSubmit = (data: ReservationStep3Values) => {
    updateDraft({ ...data, hotel: data.hotel ?? "" });
    setStep(4);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="contactName">Nombre completo</Label>
          <Input id="contactName" className="mt-1.5" {...register("contactName")} />
          {errors.contactName && <p className="mt-1.5 text-xs text-destructive">{errors.contactName.message}</p>}
        </div>
        <div>
          <Label htmlFor="contactEmail">Correo electrónico</Label>
          <Input id="contactEmail" type="email" className="mt-1.5" {...register("contactEmail")} />
          {errors.contactEmail && <p className="mt-1.5 text-xs text-destructive">{errors.contactEmail.message}</p>}
        </div>
        <div>
          <Label htmlFor="contactPhone">Teléfono (10 dígitos)</Label>
          <Input id="contactPhone" type="tel" inputMode="numeric" className="mt-1.5" {...register("contactPhone")} />
          {errors.contactPhone && <p className="mt-1.5 text-xs text-destructive">{errors.contactPhone.message}</p>}
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="hotel">Hotel (opcional)</Label>
          <Input id="hotel" placeholder="Ej. Hotel Riu Cancún" className="mt-1.5" {...register("hotel")} />
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <Button type="button" variant="outline" onClick={() => setStep(2)}>
          Atrás
        </Button>
        <Button type="submit">Continuar</Button>
      </div>
    </form>
  );
}
