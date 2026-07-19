import { z } from "zod";
import { isValidLuhn } from "@/lib/utils";

export const tripSchema = z
  .object({
    serviceType: z.enum(["hotel_hotel", "aeropuerto", "transporte_abierto", "a_medida"]),
    client: z.string().min(2, "Ingresa el cliente"),
    passengers: z.coerce.number().int().min(1, "Mínimo 1 pasajero").max(60),
    origin: z.string().min(2, "Ingresa el origen"),
    destination: z.string().min(2, "Ingresa el destino"),
    date: z.string().min(1, "Selecciona una fecha"),
    time: z.string().min(1, "Selecciona una hora"),
    amount: z.coerce.number().min(0, "Importe inválido"),
    driverId: z.string().nullable(),
    vehicleId: z.string().nullable(),
    flightNumber: z.string().optional(),
    airline: z.string().optional(),
    hotel: z.string().optional(),
    durationHours: z.coerce.number().min(0).optional(),
    specialInstructions: z.string().optional(),
    specialReception: z.boolean().optional(),
    discount: z.coerce.number().min(0).max(100).optional(),
  })
  .refine(
    (data) => data.serviceType !== "transporte_abierto" || (data.durationHours ?? 0) > 0,
    { message: "Indica la duración en horas", path: ["durationHours"] },
  );

export type TripFormValues = z.infer<typeof tripSchema>;

export const fuelSchema = z.object({
  vehicleId: z.string().min(1, "Selecciona la unidad"),
  liters: z.coerce.number().min(1, "Litros inválidos"),
  pricePerLiter: z.coerce.number().min(1, "Precio inválido"),
  odometerKm: z.coerce.number().min(0, "Kilometraje inválido"),
  station: z.string().min(2, "Ingresa la estación"),
  paymentMethod: z.enum(["efectivo", "tarjeta_flota", "vale"]),
  comments: z.string().optional(),
});

export type FuelFormValues = z.infer<typeof fuelSchema>;

export const incidentSchema = z.object({
  type: z.enum([
    "retraso",
    "pasajero_no_localizado",
    "problema_vehiculo",
    "accidente",
    "cambio_ruta",
    "trafico",
    "equipaje_excedente",
    "seguridad",
    "otro",
  ]),
  tripId: z.string().nullable(),
  description: z.string().min(5, "Describe la incidencia"),
});

export type IncidentFormValues = z.infer<typeof incidentSchema>;

// ---------------------------------------------------------------------------
// Formulario de reserva multi-paso (/reservar)
// ---------------------------------------------------------------------------

export const reservationStep1Schema = z
  .object({
    serviceType: z.enum(["hotel_hotel", "aeropuerto", "transporte_abierto", "a_medida"], {
      errorMap: () => ({ message: "Selecciona un tipo de servicio" }),
    }),
    originLocationId: z.string().min(1, "Selecciona el origen"),
    destinationLocationId: z.string().min(1, "Selecciona el destino"),
    direction: z.enum(["sencillo", "redondo"]),
  })
  .refine((data) => data.originLocationId !== data.destinationLocationId, {
    message: "El origen y el destino no pueden ser iguales",
    path: ["destinationLocationId"],
  });

export type ReservationStep1Values = z.infer<typeof reservationStep1Schema>;

export const reservationStep2Schema = z.object({
  date: z.string().min(1, "Selecciona una fecha"),
  time: z.string().min(1, "Selecciona una hora"),
  passengers: z.coerce.number().int().min(1, "Mínimo 1 pasajero").max(60, "Máximo 60 pasajeros"),
  bags: z.coerce.number().int().min(0, "Cantidad inválida").max(60),
  flightNumber: z.string().optional(),
  notes: z.string().optional(),
});

export type ReservationStep2Values = z.infer<typeof reservationStep2Schema>;

export const reservationStep3Schema = z.object({
  contactName: z.string().min(2, "Ingresa tu nombre completo"),
  contactEmail: z.string().email("Ingresa un correo válido"),
  contactPhone: z
    .string()
    .min(10, "Ingresa un teléfono a 10 dígitos")
    .max(10, "Ingresa un teléfono a 10 dígitos")
    .regex(/^\d{10}$/, "Solo dígitos, sin espacios ni guiones"),
  hotel: z.string().optional(),
});

export type ReservationStep3Values = z.infer<typeof reservationStep3Schema>;

// ---------------------------------------------------------------------------
// Pasarela de pago simulada (/pago/checkout) — nunca procesa un pago real.
// ---------------------------------------------------------------------------

export const cardPaymentSchema = z.object({
  cardNumber: z
    .string()
    .min(1, "Ingresa el número de tarjeta")
    .refine((v) => isValidLuhn(v), "Número de tarjeta inválido"),
  cardName: z.string().min(2, "Ingresa el nombre como aparece en la tarjeta"),
  expiry: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Formato MM/AA")
    .refine((v) => {
      const [month, year] = v.split("/").map(Number);
      const expDate = new Date(2000 + year, month);
      return expDate > new Date();
    }, "Tarjeta vencida"),
  cvv: z.string().regex(/^\d{3,4}$/, "CVV inválido"),
});

export type CardPaymentValues = z.infer<typeof cardPaymentSchema>;
