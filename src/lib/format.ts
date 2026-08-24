import { format, parseISO, isValid } from "date-fns";
import { es } from "date-fns/locale";

/** Formatea una fecha ISO a un formato legible en español. */
export function formatDate(iso: string, pattern = "dd MMM yyyy"): string {
  const date = parseISO(iso);
  if (!isValid(date)) return iso;
  return format(date, pattern, { locale: es });
}
