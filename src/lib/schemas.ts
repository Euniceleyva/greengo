import { z } from "zod";
import { getBookingZone, isCustomHotelId } from "@/data/booking-zones";

function todayInCancun() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Cancun",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

function validatePublicRoute(
  data: {
    originLocationId: string;
    destinationLocationId: string;
    originHotelId: string;
    originHotelName: string;
    destinationHotelId: string;
    destinationHotelName: string;
  },
  ctx: z.RefinementCtx,
) {
  (["origin", "destination"] as const).forEach((side) => {
    const locationId = data[`${side}LocationId`];
    const hotelId = data[`${side}HotelId`];
    const hotelName = data[`${side}HotelName`];
    const zone = getBookingZone(locationId);

    if (!zone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [`${side}LocationId`],
        message: "Selecciona una ubicación disponible",
      });
      return;
    }
    if (zone.category === "aeropuerto") return;

    if (!hotelId || !zone.hotels.some((hotel) => hotel.id === hotelId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [`${side}HotelId`],
        message: `Selecciona el hotel o alojamiento de ${zone.name}`,
      });
      return;
    }

    if (isCustomHotelId(zone.id, hotelId) && hotelName.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [`${side}HotelName`],
        message: "Escribe el nombre del hotel o alojamiento",
      });
    }
  });
}

function validateServiceRoute(
  data: {
    serviceType: "hotel_hotel" | "aeropuerto" | "transporte_abierto" | "a_medida";
    originLocationId: string;
    destinationLocationId: string;
  },
  ctx: z.RefinementCtx,
) {
  const originIsAirport = data.originLocationId === "loc-aeropuerto";
  const destinationIsAirport = data.destinationLocationId === "loc-aeropuerto";

  if (data.serviceType === "aeropuerto" && originIsAirport === destinationIsAirport) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["destinationLocationId"],
      message: "El origen o el destino debe ser el Aeropuerto de Cancún",
    });
  }

  if (data.serviceType === "hotel_hotel" && (originIsAirport || destinationIsAirport)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [originIsAirport ? "originLocationId" : "destinationLocationId"],
      message: "Selecciona dos zonas de hotel para este servicio",
    });
  }
}

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
  })
  .superRefine((data, ctx) => {
    validatePublicRoute(data, ctx);
    validateServiceRoute(data, ctx);
  });

export type ReservationStep1Values = z.infer<typeof reservationStep1Schema>;

export const reservationStep2Schema = z
  .object({
    date: z.string().min(1, "Selecciona una fecha"),
    time: z.string().min(1, "Selecciona una hora"),
    returnDate: z.string().optional(),
    returnTime: z.string().optional(),
    passengers: z.coerce.number().int().min(1, "Mínimo 1 pasajero").max(60, "Máximo 60 pasajeros"),
    bags: z.coerce.number().int().min(0, "Cantidad inválida").max(60),
    flightNumber: z.string().trim().max(30, "El número de vuelo es demasiado largo").optional(),
    notes: z.string().trim().max(1000, "Las notas no pueden superar 1000 caracteres").optional(),
  })
  .refine((data) => !data.date || data.date >= todayInCancun(), {
    message: "Selecciona una fecha de hoy en adelante",
    path: ["date"],
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
  })
  .refine(
    (data) =>
      data.direction !== "redondo" ||
      !data.returnDate ||
      data.returnDate !== data.date ||
      !data.returnTime ||
      data.returnTime > data.time,
    {
      message: "Si regresas el mismo día, la hora de regreso debe ser posterior a la salida",
      path: ["returnTime"],
    },
  )
  .refine((data) => data.date >= todayInCancun(), {
    message: "Selecciona una fecha de hoy en adelante",
    path: ["date"],
  })
  .superRefine((data, ctx) => {
    validatePublicRoute(data, ctx);
    validateServiceRoute(data, ctx);
  });

export type ReservationSubmission = z.infer<typeof reservationSubmissionSchema>;

export const paymentCheckoutSchema = z.object({
  reservationReference: z.string().uuid("Referencia de reservación inválida"),
});
