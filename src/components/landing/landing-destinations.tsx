 "use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { DESTINATIONS } from "@/mocks/destinations";
import { usePublicLocale } from "@/components/shared/public-locale";

const MOODS = ["Mar & pausa", "Mesa & ciudad", "Naturaleza", "Romance", "Con amigos", "Historia viva"];
const MOODS_EN = ["Sea & stillness", "Dining & city", "Nature", "Romance", "With friends", "Living history"];
const DESCRIPTIONS_EN = [
  "Turquoise beaches and the liveliest nightlife in the Mexican Caribbean.",
  "Bohemian energy, Fifth Avenue, and ferry access to Cozumel.",
  "Seaside ruins, cenotes, and a bohemian-chic lifestyle.",
  "A small island with calm beaches, a short ferry ride away.",
  "One of the Caribbean’s finest diving and snorkeling destinations.",
  "A nature park of underground rivers and Mexican culture.",
];

export function LandingDestinations() {
  const { text } = usePublicLocale();
  return (
    <section id="destinos" className="px-5 py-24 sm:px-8 lg:px-12 lg:py-40">
      <div className="mx-auto max-w-[1480px]">
        <div data-reveal className="flex flex-col gap-8 border-b border-[var(--mkt-border)] pb-10 lg:flex-row lg:items-end lg:justify-between"><div><p className="mkt-eyebrow text-[var(--mkt-coral)]">{text("Elige cómo quieres sentirte", "Choose how you want to feel")}</p><h2 className="mt-4 max-w-4xl font-heading text-5xl font-medium leading-[.92] tracking-[-.05em] sm:text-7xl lg:text-8xl">{text("Una costa, muchas formas de vivirla.", "One coast, countless ways to live it.")}</h2></div><p className="max-w-sm text-sm leading-7 text-[var(--mkt-muted)]">{text("Del agua en calma a una sobremesa que termina bailando. Tu traslado conecta cada momento.", "From calm waters to dinner that ends on the dance floor. Your transfer connects every moment.")}</p></div>
        <div className="mt-12 grid grid-cols-1 gap-x-5 gap-y-16 sm:grid-cols-2 lg:grid-cols-12">
          {DESTINATIONS.map((destination, i) => {
            const size = i === 0 || i === 3 ? "lg:col-span-7" : i === 1 || i === 4 ? "lg:col-span-5 lg:pt-24" : "lg:col-span-6";
            return <Link data-reveal key={destination.slug} href={`/destinos/${destination.slug}`} className={`group ${size}`}>
              <div className={`mkt-photo-frame relative ${i % 3 === 1 ? "aspect-[4/5]" : "aspect-[16/10]"}`}><Image src={destination.image} alt={destination.name} fill sizes="(max-width:768px) 100vw, 55vw" className="object-cover" /><span className="absolute left-4 top-4 bg-[var(--mkt-surface)] px-3 py-2 text-[10px] font-bold uppercase tracking-[.15em] text-[var(--mkt-ink)]">{text(MOODS[i], MOODS_EN[i])}</span></div>
              <div className="mt-5 flex items-start justify-between gap-4"><div><h3 className="font-heading text-3xl font-medium tracking-[-.03em]">{destination.name}</h3><p className="mt-2 max-w-lg text-sm leading-6 text-[var(--mkt-muted)]">{text(destination.shortDescription, DESCRIPTIONS_EN[i])}</p></div><ArrowRight className="mt-2 h-5 w-5 shrink-0 transition-transform duration-200 group-hover:translate-x-1" /></div>
            </Link>;
          })}
        </div>
      </div>
    </section>
  );
}
