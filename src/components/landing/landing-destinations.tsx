import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { DESTINATIONS } from "@/mocks/destinations";

export function LandingDestinations() {
  return (
    <section id="destinos" className="bg-[#132e2a] px-5 py-32 text-white sm:px-8 md:py-48">
      <div className="mx-auto max-w-[1380px]">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <h2 className="max-w-5xl text-[clamp(3rem,7vw,7.2rem)] font-black leading-[0.88] tracking-[-0.068em]">
            Seis excusas perfectas para salir del hotel.
          </h2>
          <p className="max-w-sm text-lg font-medium leading-relaxed text-white/65">
            Mar, selva, ruinas o ciudad. Elige la escena; GreenGo te deja justo donde empieza.
          </p>
        </div>

        <div className="mt-20 flex flex-col gap-2 lg:h-[43rem] lg:flex-row" role="list">
          {DESTINATIONS.map((destination, index) => (
            <Link key={destination.slug} href={`/destinos/${destination.slug}`} data-gsap-image className="group relative min-h-[21rem] flex-1 overflow-hidden rounded-[1.5rem] transition-[flex] duration-700 ease-out hover:flex-[3.5] focus-visible:flex-[3.5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c8f04b]" role="listitem">
              <Image
                src={destination.image}
                alt={destination.name}
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover opacity-90 contrast-125 transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#061816] via-[#061816]/10 to-transparent" aria-hidden />
              <span className="absolute left-5 top-5 text-xs font-black tracking-[0.18em] text-white/75">{String(index + 1).padStart(2, "0")}</span>
              <div className="absolute inset-x-0 bottom-0 p-6">
                <h3 className="max-w-xs text-2xl font-black leading-none tracking-[-0.045em] sm:text-3xl">{destination.name}</h3>
                <p className="mt-3 max-h-0 max-w-sm overflow-hidden text-sm leading-relaxed text-white/70 opacity-0 transition-all duration-500 group-hover:max-h-28 group-hover:opacity-100 group-focus-visible:max-h-28 group-focus-visible:opacity-100">{destination.shortDescription}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-black text-[#c8f04b]">
                  Ir hasta allá <ArrowUpRight className="h-4 w-4" aria-hidden />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
