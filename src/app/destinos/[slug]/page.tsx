import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Tag } from "lucide-react";
import { DESTINATIONS, destinationBySlug } from "@/mocks/destinations";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingFooter } from "@/components/landing/landing-footer";
import { Button } from "@/components/landing/ui/public-controls";
import { Card } from "@/components/ui/card";
import { formatMXN } from "@/lib/utils";

export function generateStaticParams() {
  return DESTINATIONS.map((d) => ({ slug: d.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const destination = destinationBySlug(params.slug);
  if (!destination) return { title: "Destino no encontrado — GreenGo Traslados" };

  return {
    title: `${destination.name} — GreenGo Traslados`,
    description: destination.shortDescription,
    openGraph: {
      title: `${destination.name} — GreenGo Traslados`,
      description: destination.shortDescription,
      images: [destination.image],
      locale: "es_MX",
      type: "website",
    },
  };
}

export default function DestinationPage({ params }: { params: { slug: string } }) {
  const destination = destinationBySlug(params.slug);
  if (!destination) notFound();

  const related = DESTINATIONS.filter((d) => d.slug !== destination.slug).slice(0, 3);
  const reserveHref = `/reservar?destination=${destination.locationId}&serviceType=aeropuerto`;

  return (
    <div className="min-h-screen bg-tropical-background font-urbanist">
      <LandingHeader />

      <main>
        <section className="relative">
          <div className="relative h-[45vh] min-h-[320px] w-full">
            <Image
              src={destination.image}
              alt={destination.name}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" aria-hidden />
          </div>

          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="-mt-16 rounded-[28px] bg-tropical-card p-6 shadow-sketch border-2 border-tropical-border sm:-mt-20 sm:p-8">
              <Link
                href="/#destinos"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-tropical-muted hover:text-tropical-primary"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden /> Volver a destinos
              </Link>
              <h1 className="mt-3 font-urbanist text-3xl font-bold text-tropical-text sm:text-4xl">
                {destination.name}
              </h1>
              <p className="mt-2 text-base text-tropical-muted sm:text-lg">{destination.shortDescription}</p>

              <div className="mt-5 flex flex-wrap items-center gap-4 text-sm">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-tropical-primary/10 px-3 py-1.5 font-medium text-tropical-primary">
                  <Clock className="h-4 w-4" aria-hidden />
                  {destination.airportMinutes} min desde el aeropuerto
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-tropical-accent/10 px-3 py-1.5 font-medium text-tropical-accent">
                  <Tag className="h-4 w-4" aria-hidden />
                  Desde {formatMXN(destination.priceFrom)}
                </span>
              </div>

              <div className="mt-6">
                <Link href={reserveHref}>
                  <Button size="lg">Reservar traslado a {destination.name}</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <h2 className="font-urbanist text-xl font-semibold text-tropical-text">Sobre este destino</h2>
              <p className="mt-3 text-base leading-relaxed text-tropical-muted">{destination.description}</p>
            </div>

            <div>
              <h2 className="font-urbanist text-xl font-semibold text-tropical-text">Lo más destacado</h2>
              <ul className="mt-3 space-y-2">
                {destination.highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="flex items-start gap-2 rounded-lg bg-tropical-surface px-3 py-2 text-sm text-tropical-text"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-tropical-primary" aria-hidden />
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section className="bg-tropical-surface py-12 sm:py-16">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <h2 className="font-urbanist text-xl font-semibold text-tropical-text">Otros destinos</h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-3">
                {related.map((d) => (
                  <Link key={d.slug} href={`/destinos/${d.slug}`} className="group">
                    <Card className="h-full overflow-hidden transition-shadow group-hover:shadow-sketch">
                      <div className="relative aspect-[4/3] w-full">
                        <Image
                          src={d.image}
                          alt={d.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-urbanist text-base font-semibold text-tropical-text">{d.name}</h3>
                        <p className="mt-1 text-sm text-tropical-muted">{d.shortDescription}</p>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <LandingFooter />
    </div>
  );
}
