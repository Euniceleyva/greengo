 "use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { ServiceType } from "@/types";
import { usePublicLocale } from "@/components/shared/public-locale";

const SERVICES: { type: ServiceType; need: [string,string]; title: [string,string]; description: [string,string] }[] = [
  { type: "aeropuerto", need: ["Llegar sin estrés", "Arrive stress-free"], title: ["Aeropuerto ↔ hotel", "Airport ↔ hotel"], description: ["Recepción puntual, seguimiento de vuelo y un trayecto privado hasta tu descanso.", "On-time pickup, flight tracking, and a private ride straight to your stay."] },
  { type: "hotel_hotel", need: ["Cambiar de escenario", "Change the scenery"], title: ["Hotel a hotel", "Hotel to hotel"], description: ["Muévete por la costa sin transbordos, esperas ni equipaje de un lado a otro.", "Move along the coast without transfers, waiting, or carrying luggage around."] },
  { type: "transporte_abierto", need: ["Explorar con libertad", "Explore freely"], title: ["Chofer por horas", "Driver by the hour"], description: ["Una unidad contigo para unir playa, gastronomía, compras y noche a tu propio ritmo.", "A vehicle with you to connect beach, dining, shopping, and nightlife at your pace."] },
  { type: "a_medida", need: ["Compartir la experiencia", "Share the experience"], title: ["Viajes privados y grupos", "Private trips and groups"], description: ["Recepciones, cenas, tours y celebraciones coordinadas alrededor de tu plan.", "Arrivals, dinners, tours, and celebrations coordinated around your plans."] },
];

export function LandingServices() {
  const { text } = usePublicLocale();
  return (
    <section id="servicios" className="bg-[var(--mkt-bg-alt)] px-5 py-24 sm:px-8 lg:px-12 lg:py-36">
      <div className="mx-auto grid max-w-[1480px] gap-16 lg:grid-cols-[.82fr_1.18fr]">
        <div data-reveal className="lg:sticky lg:top-28 lg:self-start"><p className="mkt-eyebrow text-[var(--mkt-coral)]">{text("Tu viaje, resuelto", "Your journey, handled")}</p><h2 className="mt-5 font-heading text-5xl font-medium leading-[.94] tracking-[-.045em] sm:text-7xl">{text("Nos encargamos del camino.", "We take care of the road.")}</h2><div className="relative mt-12 aspect-[4/5] max-w-md overflow-hidden"><Image src="/images/destinations/petempich.webp" alt="Costa tranquila de la Riviera Maya" fill sizes="430px" className="object-cover" /></div></div>
        <div className="border-t border-[var(--mkt-border)]">
          {SERVICES.map((service, i) => (
            <article data-reveal key={service.type} className="group grid gap-4 border-b border-[var(--mkt-border)] py-9 sm:grid-cols-[52px_1fr_auto] sm:py-12">
              <span className="text-xs tracking-[.14em] text-[var(--mkt-muted)]">0{i + 1}</span>
              <div><p className="mkt-eyebrow text-[var(--mkt-sea)]">{text(...service.need)}</p><h3 className="mt-2 font-heading text-3xl font-medium tracking-[-.03em] sm:text-4xl">{text(...service.title)}</h3><p className="mt-3 max-w-xl text-sm leading-7 text-[var(--mkt-muted)]">{text(...service.description)}</p></div>
              <Link href={`/reservar?serviceType=${service.type}`} aria-label={`${text("Cotizar", "Book")} ${text(...service.title)}`} className="flex h-12 w-12 items-center justify-center self-center border border-[var(--mkt-border)] transition-all duration-200 group-hover:translate-x-1 group-hover:bg-[var(--mkt-ink)] group-hover:text-white"><ArrowUpRight className="h-5 w-5" /></Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
