import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Genera un id corto único para registros creados en el DEMO. */
export function shortId(prefix = "id"): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Formatea un número como moneda MXN. */
export function formatMXN(value: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Formatea un número con separador de miles. */
export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat("es-MX", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}
