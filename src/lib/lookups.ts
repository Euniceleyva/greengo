import type { Driver, Trip, Vehicle } from "@/types";

export function vehicleById(vehicles: Vehicle[], id: string | null) {
  return vehicles.find((v) => v.id === id) ?? null;
}

export function driverById(drivers: Driver[], id: string | null) {
  return drivers.find((d) => d.id === id) ?? null;
}

export function vehicleLabel(vehicles: Vehicle[], id: string | null) {
  const v = vehicleById(vehicles, id);
  return v ? `${v.code} · ${v.plates}` : "Sin asignar";
}

export function driverName(drivers: Driver[], id: string | null) {
  return driverById(drivers, id)?.name ?? "Sin asignar";
}

export const TODAY_ISO = "2026-07-12";

export function isToday(trip: Trip) {
  return trip.date === TODAY_ISO;
}
