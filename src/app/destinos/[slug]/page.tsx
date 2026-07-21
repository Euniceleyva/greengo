import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { DESTINATIONS, destinationBySlug } from "@/mocks/destinations";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingFooter } from "@/components/landing/landing-footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LocalizedMoney, LocalizedText } from "@/components/shared/localized-value";

const DESTINATION_EN: Record<string, { short: string; description: string; highlights: string[] }> = {
  "zona-hotelera": { short: "Turquoise beaches and the liveliest nightlife in the Mexican Caribbean.", description: "Cancun’s Hotel Zone brings together renowned resorts, white-sand beaches, restaurants, bars, and nightlife—ideal when you want comfort and everything nearby.", highlights: ["Minutes from the airport", "Public beach access", "Shopping and nightlife"] },
  "playa-del-carmen": { short: "Bohemian energy, Fifth Avenue, and ferry access to Cozumel.", description: "Just over an hour from Cancun, Playa del Carmen blends relaxed beaches with the energy of Fifth Avenue, lined with shops, cafés, and restaurants.", highlights: ["Pedestrian Fifth Avenue", "Ferry to Cozumel", "Excellent dining scene"] },
  tulum: { short: "Seaside ruins, cenotes, and a bohemian-chic lifestyle.", description: "Tulum is known for its Mayan ruins overlooking the Caribbean, nearby cenotes, and relaxed design-led hotels—one of the Riviera Maya’s most sought-after escapes.", highlights: ["Seaside archaeological site", "Nearby cenotes", "Boutique hotels"] },
  "isla-mujeres": { short: "A small island with calm beaches, a short ferry ride away.", description: "Across from Cancun, Isla Mujeres offers shallow turquoise water, a colorful town, and leisurely golf-cart rides. Ground transfer to the ferry terminal is included; ferry tickets are separate.", highlights: ["Calm-water beaches", "Perfect for a full day", "Walkable town"] },
  cozumel: { short: "One of the Caribbean’s finest diving and snorkeling destinations.", description: "Cozumel is internationally known for its protected coral reefs. Ground transfer reaches the ferry port; the crossing is booked separately.", highlights: ["Protected coral reefs", "Diving and snorkeling", "Waterfront town"] },
  xcaret: { short: "A nature park of underground rivers and Mexican culture.", description: "Xcaret combines nature, underground rivers, wildlife, and cultural performances in one destination—an iconic day trip from Cancun.", highlights: ["Underground rivers", "Cultural performances", "Ideal for a day trip"] },
};

export function generateStaticParams() {
  return DESTINATIONS.map((d) => ({ slug: d.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const destination = destinationBySlug(params.slug);
  if (!destination) return { title: "Destino no encontrado — Marea" };

  return {
    title: `${destination.name} — Marea`,
    description: destination.shortDescription,
    openGraph: {
      title: `${destination.name} — Marea`,
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
  const destinationEn = DESTINATION_EN[destination.slug];

  return (
    <div className="public-theme min-h-screen bg-background">
      <LandingHeader />

      <main>
        <section className="relative bg-[var(--mkt-night)] text-white">
          <div className="relative h-[72vh] min-h-[560px] w-full">
            <Image
              src={destination.image}
              alt={destination.name}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(8,31,43,.88),rgba(8,31,43,.05)_70%)]" aria-hidden />
            <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1320px] px-5 pb-12 sm:px-8 lg:px-12 lg:pb-16">
              <Link
                href="/#destinos"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.12em] text-white/65 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden /> <LocalizedText es="Volver a destinos" en="Back to destinations" />
              </Link>
              <p className="mkt-eyebrow mt-8 text-[var(--mkt-gold)]"><LocalizedText es="Destino · Riviera Maya" en="Destination · Riviera Maya" /></p>
              <h1 className="mt-3 font-heading text-6xl font-medium leading-none tracking-[-.05em] text-white sm:text-8xl">
                {destination.name}
              </h1>
              <p className="mt-4 max-w-xl text-base text-white/70 sm:text-lg"><LocalizedText es={destination.shortDescription} en={destinationEn.short} /></p>

              <div className="mt-5 flex flex-wrap items-center gap-4 text-sm">
                <span className="inline-flex items-center gap-1.5 border-l border-white/40 pl-3 font-medium text-white/75">
                  <Clock className="h-4 w-4" aria-hidden />
                  {destination.airportMinutes} min desde el aeropuerto
                </span>
                <span className="text-white/75"><LocalizedText es="Traslado desde" en="Transfer from" /> <LocalizedMoney amount={destination.priceFrom} /></span>
              </div>

              <div className="mt-6">
                <Link href={reserveHref}>
                  <Button size="lg" className="rounded-none bg-[var(--mkt-coral)]"><LocalizedText es="Reservar traslado" en="Book transfer" /> <ArrowRight /></Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8 lg:px-12 lg:py-32">
          <div className="grid gap-16 lg:grid-cols-[1.3fr_.7fr]">
            <div>
              <p className="mkt-eyebrow text-[var(--mkt-coral)]"><LocalizedText es="La experiencia" en="The experience" /></p>
              <h2 className="mt-4 font-heading text-5xl font-medium tracking-[-.04em]"><LocalizedText es="Un lugar para cambiar de ritmo." en="A place to change your pace." /></h2>
              <p className="mt-7 max-w-2xl text-lg leading-9 text-muted-foreground"><LocalizedText es={destination.description} en={destinationEn.description} /></p>
            </div>

            <div>
              <h2 className="mkt-eyebrow text-[var(--mkt-sea)]"><LocalizedText es="Lo que te espera" en="What awaits" /></h2>
              <ul className="mt-6 border-t border-[var(--mkt-border)]">
                {destination.highlights.map((highlight, index) => (
                  <li
                    key={highlight}
                    className="flex items-start gap-3 border-b border-[var(--mkt-border)] py-4 text-sm text-foreground"
                  >
                    <span className="mt-2 h-px w-5 shrink-0 bg-[var(--mkt-coral)]" aria-hidden />
                    <LocalizedText es={highlight} en={destinationEn.highlights[index]} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section className="bg-[var(--mkt-bg-alt)] py-20 lg:py-28">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <p className="mkt-eyebrow text-[var(--mkt-coral)]"><LocalizedText es="Sigue descubriendo" en="Keep exploring" /></p>
              <h2 className="mt-3 font-heading text-5xl font-medium tracking-[-.04em] text-foreground"><LocalizedText es="Otros ritmos de la costa" en="Other rhythms of the coast" /></h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-3">
                {related.map((d) => (
                  <Link key={d.slug} href={`/destinos/${d.slug}`} className="group">
                    <Card className="h-full overflow-hidden rounded-none border-0 bg-transparent shadow-none">
                      <div className="relative aspect-[4/3] w-full">
                        <Image
                          src={d.image}
                          alt={d.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="px-0 py-4">
                        <h3 className="font-heading text-2xl font-medium text-foreground">{d.name}</h3>
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
