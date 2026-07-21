import Link from "next/link";
import { Building2, Plane, Car, Sparkles, ArrowRight } from "lucide-react";
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
    <section id="servicios" data-adventure-reveal className="adventure-services py-20 sm:py-28">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
        <div className="adventure-services__intro">
          <div data-reveal-item>
            <p className="adventure-kicker">Elige tu carril</p>
            <h2>Hay más de una forma de llegar al agua.</h2>
          </div>
          <p data-reveal-item>Desde un pickup puntual hasta un día entero con chofer. Tú pones el plan; nosotros conectamos los puntos.</p>
        </div>

        <div className="adventure-road-signs mt-14">
          {SERVICES.map(({ type, icon: Icon, title, description }, index) => (
            <Link key={type} href={`/reservar?serviceType=${type}`} data-reveal-item className="adventure-road-sign group">
              <span className="adventure-road-sign__number">{String(index + 1).padStart(2, "0")}</span>
              <Icon className="adventure-road-sign__icon" aria-hidden />
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
              <span className="adventure-road-sign__action">
                Cotizar <ArrowRight aria-hidden />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
