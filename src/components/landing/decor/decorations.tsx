// Ilustraciones ligeras en SVG para el sistema visual público
// ("Tropical Travel Sketchbook"). Sin dependencias externas, sin imágenes
// pesadas: sólo trazos y formas simples derivadas de la paleta de marca.

import { cn } from "@/lib/utils";

export function SunDoodle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={cn("text-tropical-accent", className)} aria-hidden fill="none">
      <circle cx="50" cy="50" r="22" fill="currentColor" opacity="0.9" />
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i * Math.PI) / 4;
        const x1 = 50 + Math.cos(angle) * 30;
        const y1 = 50 + Math.sin(angle) * 30;
        const x2 = 50 + Math.cos(angle) * 42;
        const y2 = 50 + Math.sin(angle) * 42;
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

export function PalmDoodle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 140" className={cn("text-tropical-primary", className)} aria-hidden fill="none">
      <path d="M60 138 C 58 100, 62 70, 60 40" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      <path
        d="M60 42 C 40 30, 20 32, 6 20"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M60 42 C 78 26, 96 26, 114 14"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M60 40 C 46 20, 34 8, 18 4"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M60 40 C 72 18, 86 4, 104 -2"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        transform="translate(0,6)"
      />
      <path d="M60 40 C 60 20, 58 6, 60 -4" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

export function WaveDivider({ className, flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 400 24"
      preserveAspectRatio="none"
      className={cn("h-6 w-full text-tropical-secondary/60", flip && "rotate-180", className)}
      aria-hidden
      fill="none"
    >
      <path
        d="M0 12 C 40 2, 80 22, 120 12 S 200 2, 240 12 S 320 22, 360 12 S 400 4, 400 12"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Mancha de acuarela suave usada como fondo decorativo detrás de contenido. */
export function WatercolorBlob({
  className,
  tone = "primary",
}: {
  className?: string;
  tone?: "primary" | "secondary" | "accent";
}) {
  const fill =
    tone === "secondary"
      ? "hsl(var(--brand-secondary-light) / 0.35)"
      : tone === "accent"
        ? "hsl(var(--brand-accent) / 0.25)"
        : "hsl(var(--brand-primary-light) / 0.35)";
  return (
    <svg viewBox="0 0 200 200" className={cn("absolute", className)} aria-hidden>
      <path
        fill={fill}
        d="M45.4,-58.6C58.1,-51.2,67.3,-36.6,71.9,-20.6C76.5,-4.6,76.5,12.8,69.9,27.4C63.3,42,50.1,53.8,35.1,61.4C20.1,69,3.3,72.4,-13.9,71.1C-31.1,69.8,-48.7,63.8,-59.9,51.6C-71.1,39.4,-75.9,21,-76.4,2.4C-76.9,-16.2,-73.1,-32.4,-63.1,-43.9C-53.1,-55.4,-36.9,-62.2,-20.9,-68.4C-4.9,-74.6,10.9,-80.2,25.6,-76.8C40.3,-73.4,32.7,-65.9,45.4,-58.6Z"
        transform="translate(100 100)"
      />
    </svg>
  );
}

/** Ruta punteada tipo mapa de viaje, con un pin al final. Se anima con GSAP (stroke-dashoffset) desde el componente que la usa. */
export function RoutePath({ className, id = "route-path" }: { className?: string; id?: string }) {
  return (
    <svg viewBox="0 0 320 120" className={cn("overflow-visible", className)} aria-hidden fill="none">
      <path
        id={id}
        d="M6 100 C 60 100, 70 40, 120 40 S 190 90, 240 60 S 280 10, 312 14"
        stroke="hsl(var(--brand-accent))"
        strokeWidth="4"
        strokeDasharray="2 12"
        strokeLinecap="round"
      />
      <circle cx="6" cy="100" r="6" fill="hsl(var(--brand-secondary))" />
      <PinIcon x={296} y={2} />
    </svg>
  );
}

function PinIcon({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <path
        d="M8 0C3.6 0 0 3.6 0 8c0 6 8 16 8 16s8-10 8-16c0-4.4-3.6-8-8-8z"
        fill="hsl(var(--brand-primary))"
      />
      <circle cx="8" cy="8" r="3" fill="white" />
    </g>
  );
}

/** Sello tipo pasaporte — usado como insignia de confianza/estado. */
export function PassportStamp({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-20 w-20 shrink-0 rotate-[-8deg] items-center justify-center rounded-full border-[3px] border-dashed border-tropical-secondary/70 text-center font-hand text-[11px] leading-tight text-tropical-secondary",
        className,
      )}
      aria-hidden
    >
      {label}
    </div>
  );
}

/** Pequeña etiqueta tipo sticker de equipaje. */
export function StickerBadge({
  children,
  tone = "primary",
  className,
}: {
  children: React.ReactNode;
  tone?: "primary" | "accent" | "secondary";
  className?: string;
}) {
  const toneClasses = {
    primary: "bg-tropical-primary text-white",
    accent: "bg-tropical-accent text-white",
    secondary: "bg-tropical-secondary text-white",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-hand text-base leading-none shadow-sketch",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
