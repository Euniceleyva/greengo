import * as React from "react";
import { cn } from "@/lib/utils";

// Nota: no usado en /admin ni /driver — estilo del sistema visual público.
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-tropical-surface", className)}
      {...props}
    />
  );
}

export function Separator({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-tropical-border", className)} />;
}

/** Tooltip simple basado en el atributo title nativo, con estilo de ayuda. */
export function InfoHint({ text }: { text: string }) {
  return (
    <span
      title={text}
      className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-tropical-surface text-[10px] font-bold text-tropical-muted"
      aria-label={text}
    >
      ?
    </span>
  );
}
