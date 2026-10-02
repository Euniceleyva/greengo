"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reservationStep1Schema, type ReservationStep1Values } from "@/lib/schemas";
import { useReservationStore } from "@/stores/reservation-store";
import {
  BOOKING_ZONE_OPTIONS,
  getBookingZone,
  isCustomHotelId,
} from "@/data/booking-zones";
import { PUBLIC_SERVICE_TYPE_LABELS } from "@/constants";
import { Button } from "@/components/ui/button";
import { Input, Select, Label } from "@/components/ui/input";
import type { ServiceType } from "@/types";

const SERVICE_TYPES: ServiceType[] = ["aeropuerto", "hotel_hotel", "transporte_abierto", "a_medida"];

export function Step1Service() {
  const draft = useReservationStore((s) => s.draft);
  const updateDraft = useReservationStore((s) => s.updateDraft);
  const setStep = useReservationStore((s) => s.setStep);
  const clearConfirmedFolio = useReservationStore((s) => s.clearConfirmedFolio);
  const initialOriginId = getBookingZone(draft.originLocationId) ? draft.originLocationId! : "loc-aeropuerto";
  const initialDestinationId = getBookingZone(draft.destinationLocationId) ? draft.destinationLocationId! : "loc-zona-hotelera";

  const form = useForm<ReservationStep1Values>({
    resolver: zodResolver(reservationStep1Schema),
    defaultValues: {
      serviceType: draft.serviceType ?? "aeropuerto",
      originLocationId: initialOriginId,
      destinationLocationId: initialDestinationId,
      originHotelId: draft.originHotelId,
      originHotelName: draft.originHotelName,
      destinationHotelId: draft.destinationHotelId,
      destinationHotelName: draft.destinationHotelName,
      direction: draft.direction,
    },
  });
  const { control, register, handleSubmit, getValues, setValue, formState: { errors } } = form;
  const serviceType = useWatch({ control, name: "serviceType" });

  const resetHotels = () => {
    setValue("originHotelId", "", { shouldValidate: false });
    setValue("originHotelName", "", { shouldValidate: false });
    setValue("destinationHotelId", "", { shouldValidate: false });
    setValue("destinationHotelName", "", { shouldValidate: false });
  };

  const applyServiceType = (nextType: ServiceType) => {
    const originId = getValues("originLocationId");
    const destinationId = getValues("destinationLocationId");
    const originIsAirport = originId === "loc-aeropuerto";
    const destinationIsAirport = destinationId === "loc-aeropuerto";

    if (nextType === "aeropuerto" && originIsAirport === destinationIsAirport) {
      setValue("originLocationId", "loc-aeropuerto", { shouldValidate: false });
      setValue("destinationLocationId", "loc-zona-hotelera", { shouldValidate: false });
      resetHotels();
    }

    if (nextType === "hotel_hotel" && (originIsAirport || destinationIsAirport)) {
      setValue("originLocationId", "loc-zona-hotelera", { shouldValidate: false });
      setValue("destinationLocationId", "loc-zona-2", { shouldValidate: false });
      resetHotels();
    }
  };

  const onSubmit = (data: ReservationStep1Values) => {
    const origin = getBookingZone(data.originLocationId);
    const destination = getBookingZone(data.destinationLocationId);
    const originHotel = origin?.hotels.find((hotel) => hotel.id === data.originHotelId);
    const destinationHotel = destination?.hotels.find((hotel) => hotel.id === data.destinationHotelId);
    const publicHotelName = destination?.category !== "aeropuerto"
      ? data.destinationHotelName || destinationHotel?.name || ""
      : data.originHotelName || originHotel?.name || "";

    updateDraft({ ...data, hotel: publicHotelName });
    clearConfirmedFolio();
    setStep(2);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="serviceType">Tipo de servicio</Label>
          <Controller
            name="serviceType"
            control={control}
            render={({ field }) => (
              <Select
                id="serviceType"
                className="mt-1.5"
                value={field.value}
                aria-invalid={Boolean(errors.serviceType)}
                aria-describedby={errors.serviceType ? "serviceType-error" : undefined}
                onChange={(event) => {
                  const nextType = event.target.value as ServiceType;
                  field.onChange(nextType);
                  applyServiceType(nextType);
                }}
              >
                {SERVICE_TYPES.map((type) => <option key={type} value={type}>{PUBLIC_SERVICE_TYPE_LABELS[type]}</option>)}
              </Select>
            )}
          />
          {errors.serviceType && <p id="serviceType-error" role="alert" className="mt-1.5 text-xs text-destructive">{errors.serviceType.message}</p>}
        </div>

        <LocationAndHotelFields side="origin" label="Origen" form={form} serviceType={serviceType} />
        <LocationAndHotelFields side="destination" label="Destino" form={form} serviceType={serviceType} />

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

      <div className="mt-8 flex justify-end"><Button type="submit">Continuar</Button></div>
    </form>
  );
}

type FormApi = ReturnType<typeof useForm<ReservationStep1Values>>;

function LocationAndHotelFields({
  side,
  label,
  form,
  serviceType,
}: {
  side: "origin" | "destination";
  label: string;
  form: FormApi;
  serviceType: ServiceType;
}) {
  const { control, register, setValue, formState: { errors } } = form;
  const locationField = `${side}LocationId` as const;
  const hotelField = `${side}HotelId` as const;
  const hotelNameField = `${side}HotelName` as const;
  const locationId = useWatch({ control, name: locationField });
  const hotelId = useWatch({ control, name: hotelField });
  const zone = getBookingZone(locationId);
  const locationError = errors[locationField]?.message;
  const hotelError = side === "origin" ? errors.originHotelId?.message : errors.destinationHotelId?.message;
  const hotelNameError = side === "origin" ? errors.originHotelName?.message : errors.destinationHotelName?.message;
  const showHotel = Boolean(zone && zone.category !== "aeropuerto");
  const locationOptions = serviceType === "hotel_hotel"
    ? BOOKING_ZONE_OPTIONS.filter((option) => option.id !== "loc-aeropuerto")
    : BOOKING_ZONE_OPTIONS;

  return (
    <div className="space-y-4">
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
              aria-invalid={Boolean(locationError)}
              aria-describedby={locationError ? `${locationField}-error` : undefined}
              onChange={(event) => {
                field.onChange(event);
                setValue(hotelField, "", { shouldValidate: false });
                setValue(hotelNameField, "", { shouldValidate: false });
              }}
            >
              {locationOptions.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
            </Select>
          )}
        />
        {locationError && <p id={`${locationField}-error`} role="alert" className="mt-1.5 text-xs text-destructive">{locationError}</p>}
      </div>

      {showHotel && zone && (
        <div className="adventure-hotel-field">
          <Label htmlFor={hotelField}>Hotel o alojamiento en {zone.name}</Label>
          <Controller
            name={hotelField}
            control={control}
            render={({ field }) => (
              <Select
                id={hotelField}
                className="mt-1.5"
                value={field.value}
                aria-invalid={Boolean(hotelError)}
                aria-describedby={hotelError ? `${hotelField}-error` : undefined}
                onChange={(event) => {
                  field.onChange(event);
                  if (!isCustomHotelId(zone.id, event.target.value)) {
                    setValue(hotelNameField, "", { shouldValidate: false });
                  }
                }}
              >
                <option value="">Selecciona un hotel</option>
                {zone.hotels.map((hotel) => <option key={hotel.id} value={hotel.id}>{hotel.name}</option>)}
              </Select>
            )}
          />
          {hotelError && <p id={`${hotelField}-error`} role="alert" className="mt-1.5 text-xs text-destructive">{hotelError}</p>}

          {isCustomHotelId(zone.id, hotelId) && (
            <div className="mt-3">
              <Label htmlFor={hotelNameField}>Nombre del hotel o alojamiento</Label>
              <Input
                id={hotelNameField}
                className="mt-1.5"
                placeholder="Escribe el nombre del alojamiento"
                aria-invalid={Boolean(hotelNameError)}
                aria-describedby={hotelNameError ? `${hotelNameField}-error` : undefined}
                {...register(hotelNameField)}
              />
              {hotelNameError && <p id={`${hotelNameField}-error`} role="alert" className="mt-1.5 text-xs text-destructive">{hotelNameError}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
