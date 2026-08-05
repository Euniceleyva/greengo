import type { Driver, Vehicle } from "@/types";

export function normalizeCode(value: string) {
  return value.trim().toUpperCase();
}

export function hasDuplicateVehicleCode(vehicles: Vehicle[], code: string, currentId?: string) {
  const normalized = normalizeCode(code);
  return vehicles.some((vehicle) => vehicle.id !== currentId && normalizeCode(vehicle.code) === normalized);
}

export function hasDuplicateVehiclePlates(vehicles: Vehicle[], plates: string, currentId?: string) {
  const normalized = normalizeCode(plates);
  return vehicles.some((vehicle) => vehicle.id !== currentId && normalizeCode(vehicle.plates) === normalized);
}

export function hasDuplicateDriverLicense(drivers: Driver[], licenseNumber: string, currentId?: string) {
  const normalized = normalizeCode(licenseNumber);
  return drivers.some((driver) => driver.id !== currentId && normalizeCode(driver.licenseNumber) === normalized);
}

export function isFiniteNumber(value: number) {
  return Number.isFinite(value) && !Number.isNaN(value);
}
