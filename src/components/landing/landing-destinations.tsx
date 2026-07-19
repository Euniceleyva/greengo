import Link from "next/link";
import Image from "next/image";
import { Clock, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DESTINATIONS } from "@/mocks/destinations";
import { formatMXN } from "@/lib/utils";

export function LandingDestinations() {
  return (
    <section id="destinos" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">Destinos populares</h2>
        <p className="mt-3 text-base text-muted-foreground">
          Los lugares a los que más viajan nuestros pasajeros.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {DESTINATIONS.map((destination) => (
          <Link key={destination.slug} href={`/destinos/${destination.slug}`} className="group">
            <Card className="h-full overflow-hidden transition-shadow group-hover:shadow-card group-focus-visible:ring-2 group-focus-visible:ring-ring">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={destination.image}
                  alt={destination.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <h3 className="font-heading text-lg font-semibold text-foreground">{destination.name}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{destination.shortDescription}</p>
                <div className="mt-4 flex items-center justify-between gap-2 text-sm">
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-4 w-4" aria-hidden />
                    {destination.airportMinutes} min desde el aeropuerto
                  </span>
                  <span className="font-semibold text-primary">
                    Desde {formatMXN(destination.priceFrom)}
                  </span>
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  Ver destino <ArrowRight className="h-4 w-4" aria-hidden />
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
