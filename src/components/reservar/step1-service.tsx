"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reservationStep1Schema, type ReservationStep1Values } from "@/lib/schemas";
import { useReservationStore } from "@/stores/reservation-store";
import { BOOKING_ZONES, BOOKING_ZONE_OPTIONS, getBookingZone, isCustomHotelId } from "@/data/booking-zones";
import { SERVICE_TYPE_LABELS } from "@/constants";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Input, Select, Label } from "@/components/ui/input";
import type { ServiceType } from "@/types";

const SERVICE_TYPES = Object.keys(SERVICE_TYPE_LABELS) as ServiceType[];

export function Step1Service() {
  const draft = useReservationStore((s) => s.draft);
  const updateDraft = useReservationStore((s) => s.updateDraft);
  const setStep = useReservationStore((s) => s.setStep);
  const clearConfirmedFolio = useReservationStore((s) => s.clearConfirmedFolio);

  const form = useForm<ReservationStep1Values>({
    resolver: zodResolver(reservationStep1Schema),
    defaultValues: {
      serviceType: draft.serviceType ?? "aeropuerto",
      originLocationId: draft.originLocationId ?? BOOKING_ZONES[0].id,
      destinationLocationId: draft.destinationLocationId ?? BOOKING_ZONES[1].id,
      originHotelId: draft.originHotelId,
      originHotelName: draft.originHotelName,
      destinationHotelId: draft.destinationHotelId,
      destinationHotelName: draft.destinationHotelName,
      direction: draft.direction,
    },
  });
  const { control, register, handleSubmit, setError, setValue, watch, formState: { errors } } = form;

  const originLocationId = watch("originLocationId");
  const destinationLocationId = watch("destinationLocationId");
  const originHotelId = watch("originHotelId");
  const destinationHotelId = watch("destinationHotelId");

  const onSubmit = (data: ReservationStep1Values) => {
    let hasHotelError = false;
    for (const side of ["origin", "destination"] as const) {
      const zone = getBookingZone(data[`${side}LocationId`]);
      if (!zone || zone.category === "aeropuerto") continue;
      const hotelId = data[`${side}HotelId`];
      const customName = data[`${side}HotelName`];
      if (!hotelId) {
        setError(`${side}HotelId`, { message: "Selecciona un hotel o alojamiento" });
        hasHotelError = true;
      } else if (isCustomHotelId(zone.id, hotelId) && customName.trim().length < 2) {
        setError(`${side}HotelName`, { message: "Escribe el nombre del alojamiento" });
        hasHotelError = true;
      }
    }
    if (hasHotelError) return;

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
            {SERVICE_TYPES.map((type) => <option key={type} value={type}>{SERVICE_TYPE_LABELS[type]}</option>)}
          </Select>
          {errors.serviceType && <p className="mt-1.5 text-xs text-destructive">{errors.serviceType.message}</p>}
        </div>

        <LocationAndHotelFields
          side="origin"
          label="Origen"
          zone={getBookingZone(originLocationId)}
          hotelId={originHotelId}
          form={form}
        />
        <LocationAndHotelFields
          side="destination"
          label="Destino"
          zone={getBookingZone(destinationLocationId)}
          hotelId={destinationHotelId}
          form={form}
        />

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

      <p className="mt-5 rounded-lg bg-surface-soft px-3 py-2 text-xs text-muted-foreground">
        Horario diurno: 5:00 a. m.–10:00 p. m. · Horario nocturno: 10:00 p. m.–5:00 a. m.
      </p>
      <div className="mt-8 flex justify-end"><Button type="submit">Continuar</Button></div>
    </form>
  );
}

type FormApi = ReturnType<typeof useForm<ReservationStep1Values>>;

function LocationAndHotelFields({
  side,
  label,
  zone,
  hotelId,
  form,
}: {
  side: "origin" | "destination";
  label: string;
  zone: ReturnType<typeof getBookingZone>;
  hotelId: string;
  form: FormApi;
}) {
  const { control, register, setValue, formState: { errors } } = form;
  const locationField = `${side}LocationId` as const;
  const hotelField = `${side}HotelId` as const;
  const customHotelField = `${side}HotelName` as const;

  return (
    <div>
      <Label htmlFor={locationField}>{label}</Label>
      <Controller
        name={locationField}
        control={control}
        render={({ field }) => (
          <Select
            id={locationField}
            className="mt-1.5"
            value={field.value}
            onChange={(event) => {
              field.onChange(event.target.value);
              setValue(hotelField, "");
              setValue(customHotelField, "");
            }}
          >
            {BOOKING_ZONE_OPTIONS.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
          </Select>
        )}
      />
      {errors[locationField] && <p className="mt-1.5 text-xs text-destructive">{errors[locationField]?.message}</p>}

      {zone && zone.category !== "aeropuerto" && (
        <div className="mt-3">
          <Label htmlFor={hotelField}>Hotel o alojamiento en {zone.name}</Label>
          <Controller
            name={hotelField}
            control={control}
            render={({ field }) => (
              <Combobox
                id={hotelField}
                className="mt-1.5"
                options={zone.hotels}
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                  if (!isCustomHotelId(zone.id, value)) setValue(customHotelField, "");
                }}
                placeholder="Selecciona un hotel"
                searchPlaceholder="Buscar hotel..."
              />
            )}
          />
          {errors[hotelField] && <p className="mt-1.5 text-xs text-destructive">{errors[hotelField]?.message}</p>}
          {isCustomHotelId(zone.id, hotelId) && (
            <>
              <Input
                id={customHotelField}
                className="mt-2"
                placeholder="Nombre del hotel, Airbnb o dirección"
                {...register(customHotelField)}
              />
              {errors[customHotelField] && <p className="mt-1.5 text-xs text-destructive">{errors[customHotelField]?.message}</p>}
            </>
          )}
        </div>
      )}
    </div>
  );
}
