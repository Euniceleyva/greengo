import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, MapPin } from "lucide-react";
import { DESTINATIONS } from "@/mocks/destinations";
import { formatMXN } from "@/lib/utils";

export function LandingDestinations() {
  return (
    <section id="destinos" data-adventure-reveal className="adventure-destinations px-4 py-20 sm:px-6 sm:py-32 lg:px-10">
      <div className="mx-auto max-w-[1280px]">
      <div className="adventure-destinations__heading">
        <h2 data-reveal-item>Postales que sí puedes alcanzar.</h2>
        <div data-reveal-item className="adventure-map-note">
          <MapPin className="h-5 w-5" aria-hidden />
          <span>Salimos desde Cancún<br />y seguimos tu ruta.</span>
        </div>
      </div>

      <div className="adventure-destination-grid mt-12">
        {DESTINATIONS.slice(0, 6).map((destination, index) => (
          <Link key={destination.slug} href={`/destinos/${destination.slug}`} data-reveal-item data-postcard className={`adventure-postcard adventure-postcard--${index + 1} group`}>
              <div className="adventure-postcard__image relative">
                <Image
                  src={destination.image}
                  alt={destination.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="adventure-postcard__copy">
                <h3>{destination.name}</h3>
                <p>{destination.shortDescription}</p>
                <div className="adventure-postcard__meta">
                  <span>
                    <Clock className="h-4 w-4" aria-hidden />
                    {destination.airportMinutes} min
                  </span>
                  <strong>Desde {formatMXN(destination.priceFrom)}</strong>
                </div>
                <span className="adventure-postcard__link">
                  Ver destino <ArrowRight className="h-4 w-4" aria-hidden />
                </span>
              </div>
          </Link>
        ))}
      </div>
      </div>
    </section>
  );
}
