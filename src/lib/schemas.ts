import { z } from "zod";

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
