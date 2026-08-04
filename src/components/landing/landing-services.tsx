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
    title: "Traslado hotel a hotel",
    description: "Muévete entre resorts sin perder tiempo: te recogemos en tu lobby y te llevamos directo a tu siguiente hotel en Cancún, Playa del Carmen, Tulum o Riviera Maya.",
  },
  {
    type: "aeropuerto",
    icon: Plane,
    title: "Aeropuerto de Cancún ↔ hotel",
    description: "Reserva tu traslado desde o hacia el Aeropuerto de Cancún con recepción en llegadas, seguimiento de vuelo y ruta directa a tu hotel.",
  },
  {
    type: "transporte_abierto",
    icon: Car,
    title: "Transporte privado con chofer",
    description: "Contrata un vehículo con chofer local por horas o día completo para visitar playas, cenotes, restaurantes, parques y puntos turísticos a tu ritmo.",
  },
  {
    type: "a_medida",
    icon: Sparkles,
    title: "Transporte para grupos y eventos",
    description: "Coordinamos vans, sprinters y rutas para bodas, familias, agencias y grupos, con horarios claros y soporte por WhatsApp.",
  },
];

export function LandingServices() {
  return (
    <section id="servicios" data-adventure-reveal className="adventure-services py-20 sm:py-28">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
        <div className="adventure-services__intro">
          <div data-reveal-item>
            <p className="adventure-kicker">Servicios de traslados privados en Cancún</p>
            <h2>Elige el traslado que necesitas en Cancún y Riviera Maya.</h2>
          </div>
          <p data-reveal-item>Del Aeropuerto de Cancún a tu hotel, entre resorts o hacia tus tours favoritos. Tú eliges la ruta; GreenGo coordina conductor, horario y tarifa clara.</p>
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
                Cotizar servicio <ArrowRight aria-hidden />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
