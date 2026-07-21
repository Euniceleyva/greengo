import Link from "next/link";
import Image from "next/image";
import { Building2, Plane, Car, Sparkles, ArrowUpRight } from "lucide-react";
import type { ServiceType } from "@/types";

const SERVICES: {
  type: ServiceType;
  icon: typeof Building2;
  title: string;
  description: string;
  image: string;
  tone: string;
}[] = [
  {
    type: "hotel_hotel",
    icon: Building2,
    title: "Hotel a hotel",
    description: "Traslados directos entre hoteles de Cancún y la Riviera Maya, sin escalas ni transbordos.",
    image: "/images/gallery/2.jpg",
    tone: "bg-[#0e9c9a] text-white",
  },
  {
    type: "aeropuerto",
    icon: Plane,
    title: "Aeropuerto ↔ hotel",
    description: "Recepción en el aeropuerto con seguimiento de tu vuelo, o traslado directo a tu próximo destino.",
    image: "/images/gallery/1.jpg",
    tone: "bg-[#c8f04b] text-[#132e2a]",
  },
  {
    type: "transporte_abierto",
    icon: Car,
    title: "Transporte abierto",
    description: "Renta de vehículo con chofer por el tiempo que necesites, ideal para explorar a tu ritmo.",
    image: "/images/gallery/5.jpg",
    tone: "bg-[#ff6b35] text-[#132e2a]",
  },
  {
    type: "a_medida",
    icon: Sparkles,
    title: "Soluciones a medida",
    description: "Servicios personalizados, recepción especial y descuentos para grupos y ocasiones particulares.",
    image: "/images/gallery/4.jpg",
    tone: "bg-[#132e2a] text-white",
  },
];

export function LandingServices() {
  return (
    <section id="servicios" className="px-5 py-32 sm:px-8 md:py-48">
      <div className="mx-auto max-w-[1380px]">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <h2 className="max-w-4xl text-[clamp(2.8rem,6.8vw,6.7rem)] font-black leading-[0.9] tracking-[-0.065em]">
            Tu viaje no cabe en un itinerario aburrido.
          </h2>
          <p className="max-w-sm text-lg font-medium leading-relaxed text-[#31534e]">
            Elige cómo moverte. Nosotros ponemos la ruta, el espacio y a alguien que conoce el camino.
          </p>
        </div>

        <div className="mt-20 grid grid-flow-dense auto-rows-[9rem] grid-cols-1 gap-0 overflow-hidden rounded-[2rem] sm:grid-cols-2 lg:grid-cols-6 lg:grid-rows-3">
          {SERVICES.map(({ type, icon: Icon, title, description, image, tone }, index) => (
            <article key={type} className={`group relative flex min-h-[28rem] flex-col overflow-hidden p-7 sm:p-9 ${tone} ${index === 0 ? "sm:col-span-2 lg:col-span-3 lg:row-span-3" : index === 1 ? "lg:col-span-3 lg:row-span-1 lg:min-h-0" : index === 2 ? "lg:col-span-2 lg:row-span-2 lg:min-h-0" : "lg:col-span-1 lg:row-span-2 lg:min-h-0"}`}>
              <Image src={image} alt="" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover opacity-0 mix-blend-multiply transition-all duration-700 ease-out group-hover:scale-105 group-hover:opacity-30" />
              <div className="relative flex h-full flex-col">
                <Icon className="h-8 w-8" strokeWidth={1.5} aria-hidden />
                <h3 className="mt-auto max-w-md pt-12 text-[clamp(1.8rem,3vw,3.6rem)] font-black leading-none tracking-[-0.05em]">{title}</h3>
                <p className="mt-4 max-w-md text-sm font-medium leading-relaxed opacity-80 sm:text-base">{description}</p>
              <Link
                href={`/reservar?serviceType=${type}`}
                  className="mt-6 inline-flex min-h-11 w-fit items-center gap-2 border-b border-current text-sm font-black transition-transform group-hover:translate-x-1"
              >
                  Armar esta ruta <ArrowUpRight className="h-4 w-4" aria-hidden />
              </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
