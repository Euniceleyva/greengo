import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Tag } from "lucide-react";
import { DESTINATIONS, destinationBySlug } from "@/mocks/destinations";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingFooter } from "@/components/landing/landing-footer";
import { Button } from "@/components/ui/button";
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
    <div className="min-h-screen bg-background">
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
            <div className="-mt-16 rounded-2xl bg-card p-6 shadow-card sm:-mt-20 sm:p-8">
              <Link
                href="/#destinos"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden /> Volver a destinos
              </Link>
              <h1 className="mt-3 font-heading text-3xl font-bold text-foreground sm:text-4xl">
                {destination.name}
              </h1>
              <p className="mt-2 text-base text-muted-foreground sm:text-lg">{destination.shortDescription}</p>

              <div className="mt-5 flex flex-wrap items-center gap-4 text-sm">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1.5 font-medium text-primary">
                  <Clock className="h-4 w-4" aria-hidden />
                  {destination.airportMinutes} min desde el aeropuerto
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-soft px-3 py-1.5 font-medium text-warning">
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
              <h2 className="font-heading text-xl font-semibold text-foreground">Sobre este destino</h2>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">{destination.description}</p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-semibold text-foreground">Lo más destacado</h2>
              <ul className="mt-3 space-y-2">
                {destination.highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="flex items-start gap-2 rounded-lg bg-surface-soft px-3 py-2 text-sm text-foreground"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section className="bg-surface-soft py-12 sm:py-16">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <h2 className="font-heading text-xl font-semibold text-foreground">Otros destinos</h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-3">
                {related.map((d) => (
                  <Link key={d.slug} href={`/destinos/${d.slug}`} className="group">
                    <Card className="h-full overflow-hidden transition-shadow group-hover:shadow-card">
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
                        <h3 className="font-heading text-base font-semibold text-foreground">{d.name}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{d.shortDescription}</p>
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
