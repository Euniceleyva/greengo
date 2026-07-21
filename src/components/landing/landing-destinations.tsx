import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { DESTINATIONS } from "@/mocks/destinations";
import { formatMXN } from "@/lib/utils";

export function LandingDestinations() {
  const stickyOffsets = ["top-24", "top-[7.125rem]", "top-[8.25rem]", "top-[9.375rem]"];
  return (
    <section id="destinos" className="bg-[hsl(var(--marketing-paper))] px-4 py-32 sm:px-6 md:py-48 lg:px-8">
      <div className="mx-auto max-w-[88rem]">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7"><h2 className="marketing-display text-balance text-[clamp(3.4rem,6.5vw,7rem)] font-medium leading-[0.86] tracking-[-0.05em]">El Caribe cambia en cada parada.</h2></div>
          <p className="max-w-sm text-sm leading-6 text-[hsl(var(--muted-foreground))] lg:col-span-5 lg:justify-self-end">Explora las rutas más solicitadas desde el aeropuerto. El precio mostrado es una referencia inicial.</p>
        </div>

        <div className="mt-20 space-y-10 lg:space-y-0">
          {DESTINATIONS.slice(0, 4).map((destination, index) => (
            <article key={destination.slug} data-stack-card className={`sticky ${stickyOffsets[index]} border-t border-[hsl(var(--marketing-line))] bg-[hsl(var(--marketing-paper))] py-7 lg:py-10`}>
              <Link href={`/destinos/${destination.slug}`} className="group grid gap-6 lg:grid-cols-12 lg:items-center">
                <div className="relative aspect-[16/9] overflow-hidden lg:col-span-5 lg:aspect-[16/8]"><Image data-motion-image src={destination.image} alt={destination.name} fill sizes="(max-width: 1024px) 100vw, 42vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-105" /></div>
                <div className="lg:col-span-5 lg:px-8">
                  <p className="text-xs tabular-nums text-[hsl(var(--marketing-clay))]">0{index + 1} · {destination.airportMinutes} min desde el aeropuerto</p>
                  <h3 className="marketing-display mt-3 text-4xl leading-none sm:text-5xl">{destination.name}</h3>
                  <p className="mt-4 max-w-md text-sm leading-6 text-[hsl(var(--muted-foreground))]">{destination.shortDescription}</p>
                </div>
                <div className="flex items-center justify-between lg:col-span-2 lg:block lg:text-right">
                  <p className="text-sm">Desde <span className="font-bold tabular-nums">{formatMXN(destination.priceFrom)}</span></p>
                  <ArrowUpRight className="mt-4 inline h-6 w-6 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" aria-hidden />
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
