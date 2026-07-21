import Link from "next/link";
import Image from "next/image";
import { Clock, ArrowRight, MapPin } from "lucide-react";
import { SectionHeading } from "@/components/landing/ui/section-heading";
import { DESTINATIONS } from "@/mocks/destinations";
import { formatMXN } from "@/lib/utils";

export function LandingDestinations() {
  return (
    <section id="destinos" className="relative bg-tropical-surface py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="marca estos lugares en tu mapa"
          title="Destinos populares"
          description="Los lugares a los que más viajan nuestros pasajeros."
        />

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {DESTINATIONS.map((destination, i) => (
            <Link key={destination.slug} href={`/destinos/${destination.slug}`} className="group block">
              <div className="overflow-hidden rounded-[28px] border-2 border-tropical-border bg-tropical-card shadow-sketch transition-transform duration-300 group-hover:-translate-y-1.5 group-focus-visible:ring-2 group-focus-visible:ring-tropical-secondary">
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src={destination.image}
                    alt={destination.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-tropical-deep/50 via-transparent to-transparent" aria-hidden />
                  <span className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-tropical-card/90 text-tropical-primary shadow-sketch">
                    <MapPin className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="absolute bottom-3 right-3 rounded-full bg-tropical-accent px-3 py-1 font-hand text-base text-white shadow-sketch">
                    Parada {i + 1}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-urbanist text-lg font-extrabold text-tropical-text">{destination.name}</h3>
                  <p className="mt-1.5 text-sm text-tropical-muted">{destination.shortDescription}</p>
                  <div className="mt-4 flex items-center justify-between gap-2 text-sm">
                    <span className="inline-flex items-center gap-1.5 text-tropical-muted">
                      <Clock className="h-4 w-4" aria-hidden />
                      {destination.airportMinutes} min desde el aeropuerto
                    </span>
                    <span className="font-urbanist font-bold text-tropical-primary">
                      Desde {formatMXN(destination.priceFrom)}
                    </span>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1 font-urbanist text-sm font-bold text-tropical-secondary">
                    Ver destino <ArrowRight className="h-4 w-4" aria-hidden />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
