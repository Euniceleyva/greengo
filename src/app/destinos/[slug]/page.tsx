import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { DESTINATIONS, destinationBySlug } from "@/mocks/destinations";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingFooter } from "@/components/landing/landing-footer";
import { MarketingMotion } from "@/components/landing/marketing-motion";
import { formatMXN } from "@/lib/utils";

export function generateStaticParams() {
  return DESTINATIONS.map((destination) => ({ slug: destination.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const destination = destinationBySlug(params.slug);
  if (!destination) return { title: "Destino no encontrado — Atria Transfers" };
  return {
    title: `${destination.name} — Atria Transfers`,
    description: destination.shortDescription,
    openGraph: { title: `${destination.name} — Atria Transfers`, description: destination.shortDescription, images: [destination.image], locale: "es_MX", type: "website" },
  };
}

export default function DestinationPage({ params }: { params: { slug: string } }) {
  const destination = destinationBySlug(params.slug);
  if (!destination) notFound();
  const related = DESTINATIONS.filter((item) => item.slug !== destination.slug).slice(0, 3);
  const reserveHref = `/reservar?destination=${destination.locationId}&serviceType=aeropuerto`;

  return (
    <div className="marketing-theme w-full max-w-full">
      <MarketingMotion />
      <LandingHeader />
      <main className="overflow-x-hidden">
        <section className="relative flex min-h-[82dvh] items-end overflow-hidden bg-[hsl(var(--marketing-ink))] px-4 pb-12 pt-36 text-[hsl(var(--marketing-paper))] sm:px-6 sm:pb-16 lg:px-8">
          <Image src={destination.image} alt={destination.name} fill priority sizes="100vw" className="object-cover opacity-70 contrast-125 saturate-[.72]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_top,hsl(var(--marketing-ink)/.98),hsl(var(--marketing-ink)/.08)_70%)]" aria-hidden />
          <div className="relative mx-auto grid w-full max-w-[88rem] gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-9">
              <Link href="/#destinos" className="inline-flex min-h-11 items-center gap-2 text-sm text-white/72 hover:text-white"><ArrowLeft className="h-4 w-4" /> Volver a destinos</Link>
              <h1 className="marketing-display mt-5 max-w-6xl text-balance text-[clamp(4rem,9vw,9rem)] font-medium leading-[0.8] tracking-[-0.055em]">{destination.name}</h1>
            </div>
            <div className="lg:col-span-3 lg:text-right"><p className="text-xs uppercase tracking-[0.18em] text-[hsl(var(--marketing-brass))]">Desde el aeropuerto</p><p className="mt-2 text-2xl tabular-nums">{destination.airportMinutes} min</p></div>
          </div>
        </section>

        <section className="px-4 py-24 sm:px-6 md:py-36 lg:px-8">
          <div className="mx-auto grid max-w-[88rem] gap-14 lg:grid-cols-12">
            <div className="lg:col-span-7"><p className="marketing-display text-balance text-4xl leading-[1.02] sm:text-6xl">{destination.shortDescription}</p><p className="mt-10 max-w-2xl text-base leading-8 text-[hsl(var(--muted-foreground))]">{destination.description}</p></div>
            <aside className="border-t border-[hsl(var(--marketing-line))] pt-6 lg:col-span-4 lg:col-start-9">
              <p className="text-xs uppercase tracking-[0.18em] text-[hsl(var(--marketing-clay))]">Lo esencial</p>
              <ul className="mt-5 divide-y divide-[hsl(var(--marketing-line))]">{destination.highlights.map((highlight) => <li key={highlight} className="py-4 text-sm">{highlight}</li>)}</ul>
              <p className="mt-8 text-sm text-[hsl(var(--muted-foreground))]">Traslados desde <strong className="text-foreground">{formatMXN(destination.priceFrom)}</strong></p>
              <Link href={reserveHref} className="mt-6 flex min-h-14 items-center justify-between bg-[hsl(var(--marketing-ink))] px-5 text-sm font-semibold text-[hsl(var(--marketing-paper))]">Reservar a {destination.name}<ArrowUpRight className="h-4 w-4" /></Link>
            </aside>
          </div>
        </section>

        <section className="bg-[hsl(var(--marketing-paper))] px-4 py-24 sm:px-6 md:py-36 lg:px-8">
          <div className="mx-auto max-w-[88rem]"><h2 className="marketing-display text-5xl leading-none sm:text-7xl">Sigue explorando</h2><div className="mt-14 grid gap-10 md:grid-cols-3">{related.map((item) => <Link key={item.slug} href={`/destinos/${item.slug}`} className="group"><div className="relative aspect-[4/5] overflow-hidden"><Image data-motion-image src={item.image} alt={item.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" /></div><div className="mt-4 flex items-center justify-between border-t border-[hsl(var(--marketing-line))] pt-4"><h3 className="text-lg font-medium">{item.name}</h3><ArrowUpRight className="h-4 w-4" /></div></Link>)}</div></div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
