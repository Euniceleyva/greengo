 "use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePublicLocale } from "@/components/shared/public-locale";

const STEPS = [
  { n: 1, label: "Servicio" },
  { n: 2, label: "Detalles" },
  { n: 3, label: "Contacto" },
  { n: 4, label: "Resumen" },
];

export function ReservationStepper({ current }: { current: number }) {
  const { locale } = usePublicLocale();
  const labels = locale === "es" ? STEPS : [{n:1,label:"Service"},{n:2,label:"Details"},{n:3,label:"Contact"},{n:4,label:"Summary"}];
  return (
    <ol className="flex items-center" aria-label="Progreso de la reservación">
      {labels.map((step, i) => {
        const isDone = step.n < current;
        const isCurrent = step.n === current;
        return (
          <li key={step.n} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <span
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                  isDone && "bg-primary text-primary-foreground",
                  isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary-soft",
                  !isDone && !isCurrent && "bg-muted text-muted-foreground",
                )}
              >
                {isDone ? <Check className="h-4 w-4" aria-hidden /> : step.n}
              </span>
              <span
                className={cn(
                  "text-[11px] font-medium sm:text-xs",
                  isCurrent ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </div>
            {i < labels.length - 1 && (
              <div className={cn("mx-2 h-0.5 flex-1 rounded-full sm:mx-3", isDone ? "bg-primary" : "bg-border")} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
