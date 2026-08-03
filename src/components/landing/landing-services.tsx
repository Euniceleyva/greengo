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
    description: "Cambia de hotel sin perder medio día: vamos por ti a la puerta y te llevamos directo a tu siguiente resort en Cancún, Playa del Carmen o Tulum.",
  },
  {
    type: "aeropuerto",
    icon: Plane,
    title: "Aeropuerto ↔ hotel",
    description: "Te esperamos en llegadas, seguimos tu vuelo y te llevamos directo a tu hotel sin filas, transbordos ni esperas innecesarias.",
  },
  {
    type: "transporte_abierto",
    icon: Car,
    title: "Transporte abierto",
    description: "Un vehículo privado con chofer local por horas o día completo para visitar playas, cenotes, parques y restaurantes a tu ritmo.",
  },
  {
    type: "a_medida",
    icon: Sparkles,
    title: "Soluciones a medida",
    description: "Coordinamos vans, sprinters y rutas para grupos, bodas o eventos, con horarios claros y atención por WhatsApp.",
  },
];

export function LandingServices() {
  return (
    <section id="servicios" data-adventure-reveal className="adventure-services py-20 sm:py-28">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
        <div className="adventure-services__intro">
          <div data-reveal-item>
            <p className="adventure-kicker">Servicios de transporte privado</p>
            <h2>Traslados en Cancún sin filas, prisas ni costos ocultos.</h2>
          </div>
          <p data-reveal-item>Del aeropuerto al hotel, entre resorts o a tus tours favoritos. Tú pones el plan; nosotros ponemos puntualidad, ruta clara y conductor listo.</p>
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
