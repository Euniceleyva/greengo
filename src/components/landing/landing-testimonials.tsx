"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { TESTIMONIALS } from "@/mocks/testimonials";
import { SERVICE_TYPE_LABELS } from "@/constants";

export function LandingTestimonials() {
  const [current, setCurrent] = React.useState(0);
  const testimonial = TESTIMONIALS[current];
  const move = (direction: number) => setCurrent((current + direction + TESTIMONIALS.length) % TESTIMONIALS.length);

  return (
    <section className="bg-[hsl(var(--marketing-canvas))] px-4 py-32 sm:px-6 md:py-48 lg:px-8">
      <div className="mx-auto grid max-w-[88rem] gap-14 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-3">
          <p className="max-w-xs text-sm leading-6 text-[hsl(var(--muted-foreground))]">Historias ilustrativas de pasajeros que confiaron su llegada, trayecto o celebración a nuestro equipo.</p>
          <div className="mt-8 flex gap-2">
            <button onClick={() => move(-1)} aria-label="Testimonio anterior" className="flex h-12 w-12 items-center justify-center border border-[hsl(var(--marketing-line))] transition-colors hover:bg-[hsl(var(--marketing-ink))] hover:text-[hsl(var(--marketing-paper))]"><ArrowLeft className="h-4 w-4" /></button>
            <button onClick={() => move(1)} aria-label="Testimonio siguiente" className="flex h-12 w-12 items-center justify-center border border-[hsl(var(--marketing-line))] transition-colors hover:bg-[hsl(var(--marketing-ink))] hover:text-[hsl(var(--marketing-paper))]"><ArrowRight className="h-4 w-4" /></button>
          </div>
        </div>
        <figure aria-live="polite" className="lg:col-span-9">
          <blockquote className="marketing-display text-balance text-[clamp(2.5rem,5vw,5.3rem)] font-medium leading-[0.96] tracking-[-0.04em]">“{testimonial.quote}”</blockquote>
          <figcaption className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[hsl(var(--marketing-line))] pt-5 text-sm">
            <strong>{testimonial.name}</strong><span className="text-[hsl(var(--muted-foreground))]">{testimonial.origin}</span><span className="text-[hsl(var(--marketing-clay))]">{SERVICE_TYPE_LABELS[testimonial.serviceType]}</span><span className="ml-auto tabular-nums text-[hsl(var(--muted-foreground))]">{String(current + 1).padStart(2, "0")} / {String(TESTIMONIALS.length).padStart(2, "0")}</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
