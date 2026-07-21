import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight, Building2, Car, Plane, Sparkles } from "lucide-react";

export function LandingServices() {
  return (
    <section id="servicios" className="bg-[hsl(var(--marketing-canvas))] px-4 py-32 sm:px-6 md:py-48 lg:px-8">
      <div className="mx-auto max-w-[88rem]">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <h2 className="marketing-display text-balance text-[clamp(3rem,7vw,7.5rem)] font-medium leading-[0.83] tracking-[-0.055em] lg:col-span-8">
            Un traslado para cada forma de llegar.
          </h2>
          <p className="max-w-md text-pretty text-base leading-7 text-[hsl(var(--muted-foreground))] lg:col-span-4 lg:pb-2">
            Coordinamos el trayecto completo, desde la terminal hasta la puerta de tu hotel, con atención clara y vehículos privados.
          </p>
        </div>

        <div className="mt-20 grid grid-flow-dense grid-cols-1 border-l border-t border-[hsl(var(--marketing-line))] lg:grid-cols-12">
          <article className="group border-b border-r border-[hsl(var(--marketing-line))] p-7 lg:col-span-8 lg:min-h-[22rem] lg:p-10">
            <div className="flex items-start justify-between">
              <div className="flex gap-3 text-[hsl(var(--marketing-clay))]"><Plane className="h-6 w-6" /><Building2 className="h-6 w-6" /></div>
              <span className="text-xs tabular-nums text-[hsl(var(--muted-foreground))]">01</span>
            </div>
            <h3 className="marketing-display mt-16 max-w-2xl text-4xl leading-none sm:text-6xl">Aeropuerto, hotel y todo lo que ocurre entre ambos.</h3>
            <p className="mt-6 max-w-xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">Recepción con seguimiento de vuelo y traslados directos entre hoteles de Cancún y la Riviera Maya.</p>
            <div className="mt-8 flex flex-wrap gap-6">
              <ServiceLink type="aeropuerto">Aeropuerto ↔ hotel</ServiceLink>
              <ServiceLink type="hotel_hotel">Hotel a hotel</ServiceLink>
            </div>
          </article>

          <article className="group border-b border-r border-[hsl(var(--marketing-line))] bg-[hsl(var(--marketing-ink))] p-7 text-[hsl(var(--marketing-paper))] lg:col-span-4 lg:min-h-[22rem] lg:p-10">
            <div className="flex items-start justify-between text-[hsl(var(--marketing-brass))]"><Car className="h-6 w-6" /><span className="text-xs tabular-nums">02</span></div>
            <h3 className="marketing-display mt-16 text-4xl leading-none sm:text-5xl">Tu tiempo, tu ruta.</h3>
            <p className="mt-6 text-sm leading-6 text-[hsl(var(--marketing-paper)/.62)]">Vehículo con chofer por las horas que necesites, sin itinerarios rígidos.</p>
            <ServiceLink type="transporte_abierto" dark>Transporte abierto</ServiceLink>
          </article>

          <article className="group flex flex-col justify-between gap-12 border-b border-r border-[hsl(var(--marketing-line))] p-7 lg:col-span-12 lg:min-h-64 lg:flex-row lg:items-end lg:p-10">
            <div>
              <div className="flex items-center gap-3 text-[hsl(var(--marketing-clay))]"><Sparkles className="h-6 w-6" /><span className="text-xs tabular-nums">03</span></div>
              <h3 className="marketing-display mt-8 max-w-3xl text-4xl leading-none sm:text-6xl">Viajes de grupo, recepciones y planes fuera del mapa.</h3>
            </div>
            <div className="max-w-sm lg:text-right">
              <p className="text-sm leading-6 text-[hsl(var(--muted-foreground))]">Diseñamos soluciones a medida para ocasiones particulares y grupos.</p>
              <ServiceLink type="a_medida">Hablar de mi viaje</ServiceLink>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

function ServiceLink({ type, dark = false, children }: { type: string; dark?: boolean; children: ReactNode }) {
  return <Link href={`/reservar?serviceType=${type}`} className={`mt-7 inline-flex items-center gap-2 border-b pb-1 text-sm font-medium transition-all group-hover:gap-3 ${dark ? "border-[hsl(var(--marketing-paper)/.35)] text-[hsl(var(--marketing-paper))]" : "border-[hsl(var(--marketing-ink)/.35)]"}`}>{children}<ArrowUpRight className="h-4 w-4" aria-hidden /></Link>;
}
