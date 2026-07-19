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

/** Valida un número de tarjeta con el algoritmo de Luhn. Solo para la pasarela simulada. */
export function isValidLuhn(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 12) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = Number(digits[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

/** Aplica una máscara "0000 0000 0000 0000" mientras el usuario escribe. */
export function formatCardNumber(value: string): string {
  return value
    .replace(/\D/g, "")
    .slice(0, 19)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

/** Aplica una máscara "MM/AA" mientras el usuario escribe. */
export function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}
