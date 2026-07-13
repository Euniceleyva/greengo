import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  tone?: "primary" | "success" | "warning" | "danger" | "info" | "neutral";
  /** "hero" para los indicadores de primera jerarquía, "compact" para la fila secundaria. */
  size?: "hero" | "compact";
}

const toneClasses: Record<NonNullable<KpiCardProps["tone"]>, string> = {
  primary: "bg-primary-soft text-primary",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-destructive-soft text-destructive",
  info: "bg-info-soft text-info",
  neutral: "bg-muted text-muted-foreground",
};

export function KpiCard({ label, value, icon: Icon, hint, tone = "neutral", size = "hero" }: KpiCardProps) {
  const compact = size === "compact";
  return (
    <Card className={cn(compact ? "p-3" : "p-4 sm:p-5")}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className={cn(
              "font-medium text-muted-foreground",
              compact ? "line-clamp-2 text-[11px] leading-tight" : "truncate text-xs",
            )}
          >
            {label}
          </p>
          <p className={cn("mt-1 font-bold tabular-nums text-foreground", compact ? "text-lg" : "text-2xl sm:text-3xl")}>
            {value}
          </p>
          {hint && !compact && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div
          className={cn(
            "flex shrink-0 items-center justify-center rounded-lg",
            compact ? "h-8 w-8" : "h-11 w-11",
            toneClasses[tone],
          )}
        >
          <Icon className={compact ? "h-4 w-4" : "h-5 w-5"} />
        </div>
      </div>
    </Card>
  );
}
