import { format, parseISO, isValid } from "date-fns";
import { es } from "date-fns/locale";

/** Formatea una fecha ISO a un formato legible en español. */
export function formatDate(iso: string, pattern = "dd MMM yyyy"): string {
  const date = parseISO(iso);
  if (!isValid(date)) return iso;
  return format(date, pattern, { locale: es });
}

/** Formatea una fecha-hora ISO. */
export function formatDateTime(iso: string): string {
  const date = parseISO(iso);
  if (!isValid(date)) return iso;
  return format(date, "dd MMM yyyy · HH:mm", { locale: es });
}

/** Tiempo relativo simple ("hace 5 min"). */
export function timeAgo(iso: string): string {
  const date = parseISO(iso);
  if (!isValid(date)) return iso;
  const diffMs = Date.now() - date.getTime();
  const min = Math.round(diffMs / 60000);
  if (min < 1) return "hace instantes";
  if (min < 60) return `hace ${min} min`;
  const hours = Math.round(min / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.round(hours / 24);
  return `hace ${days} d`;
}
