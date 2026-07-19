import Link from "next/link";
import { Building2, Plane, Car, Sparkles, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { ServiceType } from "@/types";

const SERVICES: {
  type: ServiceType;
  icon: typeof Building2;
  title: string;
  description: string;
}[] = [
  {
    type: "hotel_hotel",
    icon: Building2,
    title: "Hotel a hotel",
    description: "Traslados directos entre hoteles de Cancún y la Riviera Maya, sin escalas ni transbordos.",
  },
  {
    type: "aeropuerto",
    icon: Plane,
    title: "Aeropuerto ↔ hotel",
    description: "Recepción en el aeropuerto con seguimiento de tu vuelo, o traslado directo a tu próximo destino.",
  },
  {
    type: "transporte_abierto",
    icon: Car,
    title: "Transporte abierto",
    description: "Renta de vehículo con chofer por el tiempo que necesites, ideal para explorar a tu ritmo.",
  },
  {
    type: "a_medida",
    icon: Sparkles,
    title: "Soluciones a medida",
    description: "Servicios personalizados, recepción especial y descuentos para grupos y ocasiones particulares.",
  },
];

export function LandingServices() {
  return (
    <section id="servicios" className="bg-surface-soft py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
            Un servicio para cada tipo de viaje
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Elige el traslado que mejor se adapta a tu itinerario.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map(({ type, icon: Icon, title, description }) => (
            <Card key={type} className="flex flex-col p-6 transition-shadow hover:shadow-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <Icon className="h-6 w-6" aria-hidden />
              </div>
              <h3 className="mt-4 font-heading text-lg font-semibold text-foreground">{title}</h3>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{description}</p>
              <Link
                href={`/reservar?serviceType=${type}`}
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                Cotizar <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
