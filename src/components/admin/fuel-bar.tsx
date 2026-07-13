import { cn } from "@/lib/utils";

/** Barra de nivel de combustible con color según el porcentaje. */
export function FuelBar({ level }: { level: number }) {
  const color =
    level <= 20 ? "bg-destructive" : level <= 40 ? "bg-warning" : "bg-success";
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${level}%` }} />
      </div>
      <span className="w-9 text-right text-xs tabular-nums text-muted-foreground">{level}%</span>
    </div>
  );
}
