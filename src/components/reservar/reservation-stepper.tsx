import { Check, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { n: 1, label: "Servicio" },
  { n: 2, label: "Detalles" },
  { n: 3, label: "Contacto" },
  { n: 4, label: "Resumen" },
];

export function ReservationStepper({ current }: { current: number }) {
  return (
    <ol className="flex items-center" aria-label="Progreso de la reservación">
      {STEPS.map((step, i) => {
        const isDone = step.n < current;
        const isCurrent = step.n === current;
        return (
          <li key={step.n} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <span
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-urbanist text-sm font-bold transition-all",
                  isDone && "bg-tropical-primary text-white",
                  isCurrent && "scale-110 bg-tropical-accent text-white shadow-sketch ring-4 ring-tropical-accent/25",
                  !isDone && !isCurrent && "border-2 border-dashed border-tropical-border bg-tropical-card text-tropical-muted",
                )}
              >
                {isDone ? (
                  <Check className="h-4 w-4" aria-hidden />
                ) : isCurrent ? (
                  <MapPin className="h-4 w-4" aria-hidden />
                ) : (
                  step.n
                )}
              </span>
              <span
                className={cn(
                  "font-urbanist text-[11px] font-semibold sm:text-xs",
                  isCurrent ? "text-tropical-text" : "text-tropical-muted",
                )}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "mx-2 h-0.5 flex-1 rounded-full sm:mx-3",
                  isDone ? "bg-tropical-primary" : "border-t-2 border-dashed border-tropical-border bg-transparent",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
