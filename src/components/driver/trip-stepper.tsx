import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { DRIVER_STATUS_FLOW, TRIP_STATUS_LABELS } from "@/constants";
import type { TripStatus } from "@/types";

const STEP_SHORT_LABELS: Partial<Record<TripStatus, string>> = {
  asignado: "Asignado",
  en_camino: "En camino",
  en_espera: "Llegada",
  pasajero_abordado: "Abordado",
  en_curso: "En curso",
  completado: "Completado",
};

/** Indicador de progreso horizontal para el flujo de estados del conductor. */
export function TripStepper({ status }: { status: TripStatus }) {
  const currentIndex = DRIVER_STATUS_FLOW.indexOf(status);
  if (status === "cancelado" || status === "con_incidencia") {
    return (
      <p className="text-xs font-medium text-muted-foreground">
        Servicio {TRIP_STATUS_LABELS[status].toLowerCase()}.
      </p>
    );
  }

  const currentLabel = currentIndex >= 0 ? STEP_SHORT_LABELS[DRIVER_STATUS_FLOW[currentIndex]] : undefined;

  return (
    <div>
      <p className="mb-2 text-xs font-medium text-muted-foreground sm:hidden">
        Paso {currentIndex + 1} de {DRIVER_STATUS_FLOW.length} · <span className="font-semibold text-primary">{currentLabel}</span>
      </p>
      <div className="flex items-center" role="list" aria-label="Progreso del servicio">
      {DRIVER_STATUS_FLOW.map((step, i) => {
        const done = currentIndex >= 0 && i < currentIndex;
        const active = i === currentIndex;
        const isLast = i === DRIVER_STATUS_FLOW.length - 1;
        return (
          <div key={step} className={cn("flex items-center", !isLast && "flex-1")} role="listitem">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-colors",
                  done && "bg-success text-success-foreground",
                  active && "bg-primary text-primary-foreground ring-4 ring-primary-soft",
                  !done && !active && "bg-muted text-muted-foreground",
                )}
                aria-current={active ? "step" : undefined}
              >
                {done ? <Check className="h-3 w-3" /> : i + 1}
              </div>
              <span
                className={cn(
                  "hidden text-center text-[9px] leading-none sm:block",
                  active ? "font-semibold text-primary" : "text-muted-foreground",
                )}
              >
                {STEP_SHORT_LABELS[step]}
              </span>
            </div>
            {!isLast && (
              <div className={cn("mx-1 h-0.5 flex-1 rounded-full", done ? "bg-success" : "bg-muted")} />
            )}
          </div>
        );
      })}
      </div>
    </div>
  );
}
