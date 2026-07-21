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
    description: "Cambia de hotel sin perder tiempo: te recogemos en la puerta y te dejamos directo en la siguiente, sin escalas ni transbordos.",
  },
  {
    type: "aeropuerto",
    icon: Plane,
    title: "Aeropuerto ↔ hotel",
    description: "Seguimos tu vuelo en tiempo real: te esperamos en llegadas con letrero, o te llevamos al aeropuerto con margen de sobra.",
  },
  {
    type: "transporte_abierto",
    icon: Car,
    title: "Transporte abierto",
    description: "Un vehículo con chofer a tu disposición por horas o por el día completo, para ir de playa en playa a tu propio ritmo.",
  },
  {
    type: "a_medida",
    icon: Sparkles,
    title: "Soluciones a medida",
    description: "Grupos grandes, bodas o recepciones especiales: armamos un plan de transporte hecho a la medida de tu ocasión.",
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
