"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reservationStep3Schema, type ReservationStep3Values } from "@/lib/schemas";
import { useReservationStore } from "@/stores/reservation-store";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { usePublicLocale } from "@/components/shared/public-locale";

export function Step3Contact() {
  const { text } = usePublicLocale();
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
          <Label htmlFor="contactName">{text("Nombre completo", "Full name")}</Label>
          <Input id="contactName" className="mt-1.5" {...register("contactName")} />
          {errors.contactName && <p className="mt-1.5 text-xs text-destructive">{errors.contactName.message}</p>}
        </div>
        <div>
          <Label htmlFor="contactEmail">{text("Correo electrónico", "Email")}</Label>
          <Input id="contactEmail" type="email" className="mt-1.5" {...register("contactEmail")} />
          {errors.contactEmail && <p className="mt-1.5 text-xs text-destructive">{errors.contactEmail.message}</p>}
        </div>
        <div>
          <Label htmlFor="contactPhone">{text("Teléfono (10 dígitos)", "Phone number")}</Label>
          <Input id="contactPhone" type="tel" inputMode="numeric" className="mt-1.5" {...register("contactPhone")} />
          {errors.contactPhone && <p className="mt-1.5 text-xs text-destructive">{errors.contactPhone.message}</p>}
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="hotel">{text("Hotel (opcional)", "Hotel (optional)")}</Label>
          <Input id="hotel" placeholder={text("Ej. Hotel Riu Cancún", "E.g. Hotel Riu Cancun")} className="mt-1.5" {...register("hotel")} />
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <Button type="button" variant="outline" onClick={() => setStep(2)}>
          {text("Atrás", "Back")}
        </Button>
        <Button type="submit">{text("Continuar", "Continue")}</Button>
      </div>
    </form>
  );
}
