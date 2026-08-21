import { z } from "zod";

export const tripSchema = z
  .object({
    serviceType: z.enum(["hotel_hotel", "aeropuerto", "transporte_abierto", "a_medida"]),
    direction: z.enum(["sencillo", "redondo"]).optional(),
    bookingSource: z.enum(["web", "admin", "whatsapp", "agencia"]).optional(),
    client: z.string().min(2, "Ingresa el cliente"),
    contactPhone: z.string().optional(),
    contactEmail: z.string().email("Ingresa un correo válido").or(z.literal("")).optional(),
    passengers: z.coerce.number().int().min(1, "Mínimo 1 pasajero").max(60),
    bags: z.coerce.number().int().min(0, "Cantidad inválida").max(80).optional(),
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
    paymentStatus: z.enum(["pendiente", "parcial", "pagado", "cotizacion"]).optional(),
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
    originHotelId: z.string().max(100).default(""),
    originHotelName: z.string().trim().max(180).default(""),
    destinationHotelId: z.string().max(100).default(""),
    destinationHotelName: z.string().trim().max(180).default(""),
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
  returnDate: z.string().optional(),
  returnTime: z.string().optional(),
  passengers: z.coerce.number().int().min(1, "Mínimo 1 pasajero").max(60, "Máximo 60 pasajeros"),
  bags: z.coerce.number().int().min(0, "Cantidad inválida").max(60),
  flightNumber: z.string().optional(),
  notes: z.string().optional(),
});

export type ReservationStep2Values = z.infer<typeof reservationStep2Schema>;

export const reservationStep3Schema = z.object({
  contactName: z.string().trim().min(2, "Ingresa tu nombre completo").max(140, "El nombre es demasiado largo"),
  contactEmail: z.string().trim().toLowerCase().email("Ingresa un correo válido").max(254),
  contactPhone: z
    .string()
    .trim()
    .min(8, "Ingresa un teléfono válido")
    .max(25, "El teléfono es demasiado largo")
    .regex(/^[0-9+() .-]+$/, "Usa únicamente números y el código de país"),
  hotel: z.string().trim().max(180).optional(),
});

export type ReservationStep3Values = z.infer<typeof reservationStep3Schema>;

export const reservationSubmissionSchema = z.object({
  submissionKey: z.string().uuid(),
  serviceType: z.enum(["hotel_hotel", "aeropuerto", "transporte_abierto", "a_medida"]),
  originLocationId: z.string().trim().min(1).max(100),
  destinationLocationId: z.string().trim().min(1).max(100),
  originHotelId: z.string().trim().max(100).default(""),
  originHotelName: z.string().trim().max(180).default(""),
  destinationHotelId: z.string().trim().max(100).default(""),
  destinationHotelName: z.string().trim().max(180).default(""),
  direction: z.enum(["sencillo", "redondo"]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Hora inválida"),
  returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha de regreso inválida").or(z.literal("")).default(""),
  returnTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Hora de regreso inválida").or(z.literal("")).default(""),
  passengers: z.coerce.number().int().min(1).max(60),
  bags: z.coerce.number().int().min(0).max(80),
  flightNumber: z.string().trim().max(30).default(""),
  notes: z.string().trim().max(1000).default(""),
  contactName: reservationStep3Schema.shape.contactName,
  contactEmail: reservationStep3Schema.shape.contactEmail,
  contactPhone: reservationStep3Schema.shape.contactPhone,
  hotel: z.string().trim().max(180).default(""),
})
  .refine((data) => data.originLocationId !== data.destinationLocationId, {
    message: "El origen y el destino no pueden ser iguales",
    path: ["destinationLocationId"],
  })
  .refine((data) => data.direction !== "redondo" || Boolean(data.returnDate), {
    message: "Selecciona la fecha de regreso",
    path: ["returnDate"],
  })
  .refine((data) => data.direction !== "redondo" || Boolean(data.returnTime), {
    message: "Selecciona la hora de regreso",
    path: ["returnTime"],
  })
  .refine((data) => data.direction !== "redondo" || !data.returnDate || data.returnDate >= data.date, {
    message: "El regreso no puede ser anterior a la salida",
    path: ["returnDate"],
  });

export type ReservationSubmission = z.infer<typeof reservationSubmissionSchema>;

export const paymentCheckoutSchema = z.object({
  reservationReference: z.string().uuid("Referencia de reservación inválida"),
});
