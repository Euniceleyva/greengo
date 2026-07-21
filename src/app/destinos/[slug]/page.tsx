import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Tag } from "lucide-react";
import { DESTINATIONS, destinationBySlug } from "@/mocks/destinations";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingFooter } from "@/components/landing/landing-footer";
import { Button } from "@/components/ui/button";
import { LocalizedCurrency, PublicLanguageProvider } from "@/components/shared/public-language";

export function generateStaticParams() {
  return DESTINATIONS.map((d) => ({ slug: d.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const destination = destinationBySlug(params.slug);
  if (!destination) return { title: "Destino no encontrado — Marea Club" };

  return {
    title: `${destination.name} — Marea Club`,
    description: destination.shortDescription,
    openGraph: {
      title: `${destination.name} — Marea Club`,
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
    <PublicLanguageProvider>
    <div className="adventure-theme adventure-destination-page min-h-screen bg-background">
      <LandingHeader />

      <main>
        <section className="adventure-destination-hero relative">
          <div className="adventure-destination-hero__media relative h-[58vh] min-h-[430px] w-full">
            <Image
              src={destination.image}
              alt={destination.name}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="adventure-destination-hero__overlay absolute inset-0" aria-hidden />
          </div>

          <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
            <div className="adventure-destination-ticket">
              <Link
                href="/#destinos"
                className="inline-flex items-center gap-1.5 text-sm font-extrabold text-muted-foreground hover:text-primary"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden /> Volver a destinos
              </Link>
              <h1 className="mt-3 font-heading text-4xl text-foreground sm:text-6xl">
                {destination.name}
              </h1>
              <p className="mt-2 max-w-2xl text-base text-muted-foreground sm:text-lg">{destination.shortDescription}</p>

              <div className="mt-5 flex flex-wrap items-center gap-4 text-sm">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1.5 font-medium text-primary">
                  <Clock className="h-4 w-4" aria-hidden />
                  {destination.airportMinutes} min desde el aeropuerto
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-soft px-3 py-1.5 font-medium text-warning">
                  <Tag className="h-4 w-4" aria-hidden />
                  Desde <LocalizedCurrency amount={destination.priceFrom} />
                </span>
              </div>

              <div className="mt-6">
                <Link href={reserveHref}>
                  <Button size="lg" className="adventure-cta">Reservar traslado a {destination.name}</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="adventure-destination-story mx-auto max-w-[1100px] px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.35fr_.65fr]">
            <div>
              <h2>La historia detrás de la ventana</h2>
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{destination.description}</p>
            </div>

            <div>
              <h2 className="font-heading text-2xl text-foreground">Lo que vale la parada</h2>
              <ul className="adventure-highlight-list mt-5 space-y-2">
                {destination.highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="flex items-start gap-3 px-3 py-3 text-sm font-bold text-foreground"
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
          <section className="adventure-related py-16 sm:py-24">
            <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8">
              <h2>Otros puntos en el mapa</h2>
              <div className="adventure-related__grid mt-8">
                {related.map((d, index) => (
                  <Link key={d.slug} href={`/destinos/${d.slug}`} className={`adventure-related-card adventure-related-card--${index + 1} group`}>
                      <div className="relative aspect-[4/3] w-full">
                        <Image
                          src={d.image}
                          alt={d.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-5">
                        <h3 className="font-heading text-lg text-foreground">{d.name}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{d.shortDescription}</p>
                      </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <LandingFooter />
    </div>
    </PublicLanguageProvider>
  );
}
