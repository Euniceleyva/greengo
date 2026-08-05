import type { DriverDocumentKind } from "@/types";

export const DRIVER_TODAY = "2026-08-05";
export const DRIVER_LICENSE_WARNING_DAYS = 45;

export function daysUntilDriverDate(date: string, today = DRIVER_TODAY) {
  const dayMs = 86_400_000;
  const target = Date.parse(`${date}T00:00:00`);
  const current = Date.parse(`${today}T00:00:00`);
  return Math.ceil((target - current) / dayMs);
}

export function getLicenseNotice(expiresOn: string) {
  const days = daysUntilDriverDate(expiresOn);
  if (days < 0) {
    return {
      tone: "danger" as const,
      title: "Licencia vencida",
      detail: `Tu licencia venció hace ${Math.abs(days)} día(s). Reporta la renovación antes de tomar otro servicio.`,
      days,
    };
  }
  if (days <= DRIVER_LICENSE_WARNING_DAYS) {
    return {
      tone: "warning" as const,
      title: "Licencia por vencer",
      detail: `Tu licencia vence en ${days} día(s). Sube tu licencia digital actualizada cuando la renueves.`,
      days,
    };
  }
  return null;
}

export function driverDocumentLabel(kind: DriverDocumentKind) {
  return kind === "licencia_digital" ? "Licencia digital" : "Tarjeta de circulación";
}
