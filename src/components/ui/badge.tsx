import * as React from "react";
import { cn } from "@/lib/utils";
import type { BadgeTone } from "@/constants";

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-muted text-muted-foreground ring-border",
  success: "bg-success-soft text-success ring-success/15",
  warning: "bg-warning-soft text-warning ring-warning/15",
  danger: "bg-destructive-soft text-destructive ring-destructive/15",
  info: "bg-info-soft text-info ring-info/15",
  purple: "bg-violet-50 text-violet-700 ring-violet-200",
};

const dotClasses: Record<BadgeTone, string> = {
  neutral: "bg-muted-foreground",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-destructive",
  info: "bg-info",
  purple: "bg-violet-500",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  /** Muestra un punto de color antes del texto, útil cuando el badge va sin icono. */
  dot?: boolean;
}

export function Badge({ className, tone = "neutral", dot = false, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {dot && <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dotClasses[tone])} aria-hidden />}
      {children}
    </span>
  );
}
