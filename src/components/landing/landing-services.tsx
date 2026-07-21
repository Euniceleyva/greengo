import Link from "next/link";
import { Building2, Plane, Car, Sparkles, ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/landing/ui/section-heading";
import { cn } from "@/lib/utils";
import type { ServiceType } from "@/types";

const SERVICES: {
  type: ServiceType;
  icon: typeof Building2;
  title: string;
  who: string;
  description: string;
  tone: "primary" | "secondary" | "accent" | "dark";
  rotate: string;
}[] = [
  {
    type: "hotel_hotel",
    icon: Building2,
    title: "Hotel a hotel",
    who: "Para quienes recorren varios destinos",
    description: "Traslados directos entre hoteles de Cancún y la Riviera Maya, sin escalas ni transbordos.",
    tone: "primary",
    rotate: "sm:-rotate-1",
  },
  {
    type: "aeropuerto",
    icon: Plane,
    title: "Aeropuerto ↔ hotel",
    who: "Para tu llegada o tu vuelo de regreso",
    description: "Recepción en el aeropuerto con seguimiento de tu vuelo, o traslado directo a tu próximo destino.",
    tone: "secondary",
    rotate: "sm:rotate-1",
  },
  {
    type: "transporte_abierto",
    icon: Car,
    title: "Transporte abierto",
    who: "Para explorar a tu ritmo",
    description: "Renta de vehículo con chofer por el tiempo que necesites, ideal para excursiones flexibles.",
    tone: "accent",
    rotate: "sm:-rotate-1",
  },
  {
    type: "a_medida",
    icon: Sparkles,
    title: "Soluciones a medida",
    who: "Para grupos y ocasiones especiales",
    description: "Servicios personalizados, recepción especial y descuentos para grupos y ocasiones particulares.",
    tone: "dark",
    rotate: "sm:rotate-1",
  },
];

const TONE_CLASSES: Record<string, string> = {
  primary: "bg-tropical-primary text-white",
  secondary: "bg-tropical-secondary text-white",
  accent: "bg-tropical-accent text-white",
  dark: "bg-tropical-dark text-white",
};

export function LandingServices() {
  return (
    <section id="servicios" className="relative overflow-hidden bg-tropical-background py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="cuatro formas de viajar"
          title="Un servicio para cada tipo de viaje"
          description="Elige el traslado que mejor se adapta a tu itinerario."
        />

        <div className="mt-14 grid gap-8 sm:grid-cols-2">
          {SERVICES.map(({ type, icon: Icon, title, who, description, tone, rotate }) => (
            <div
              key={type}
              className={cn(
                "group relative rounded-[28px] border-2 border-tropical-border bg-tropical-card p-6 shadow-sketch transition-transform duration-300 hover:-translate-y-1 hover:rotate-0 sm:p-8",
                rotate,
              )}
            >
              <span
                className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-2xl shadow-sketch",
                  TONE_CLASSES[tone],
                )}
              >
                <Icon className="h-7 w-7" aria-hidden />
              </span>
              <p className="mt-5 font-hand text-lg text-tropical-secondary">{who}</p>
              <h3 className="mt-1 font-urbanist text-xl font-extrabold text-tropical-text">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-tropical-muted">{description}</p>
              <Link
                href={`/reservar?serviceType=${type}`}
                className="mt-5 inline-flex items-center gap-1.5 font-urbanist text-sm font-bold text-tropical-primary transition-transform group-hover:translate-x-1"
              >
                Cotizar este servicio <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
