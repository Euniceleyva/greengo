import { ClipboardList, CalendarCheck, CarFront, PartyPopper } from "lucide-react";
import { SectionHeading } from "@/components/landing/ui/section-heading";

const STEPS = [
  {
    icon: ClipboardList,
    title: "Cotiza tu traslado",
    description: "Indica origen, destino, fecha y número de pasajeros en el formulario de reserva.",
  },
  {
    icon: CalendarCheck,
    title: "Confirma tu reservación",
    description: "Revisa el desglose de tarifa y confirma tus datos de contacto en minutos.",
  },
  {
    icon: CarFront,
    title: "Te recogemos a tiempo",
    description: "Un conductor asignado te espera en el punto acordado, con seguimiento de tu vuelo si aplica.",
  },
  {
    icon: PartyPopper,
    title: "Disfruta tu viaje",
    description: "Llega a tu destino con tranquilidad y sin preocuparte por el transporte.",
  },
];

export function LandingHowItWorks() {
  return (
    <section id="como-funciona" className="relative overflow-hidden bg-gradient-deep py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="tu ruta hacia Cancún"
          title="Cómo funciona"
          description="Reservar tu traslado toma solo unos minutos."
          className="[&_h2]:text-white [&_p]:text-tropical-surface/80"
        />

        <div className="relative mt-16">
          {/* Línea de ruta que conecta las paradas (sólo desktop) */}
          <svg
            className="pointer-events-none absolute left-0 top-7 hidden w-full lg:block"
            viewBox="0 0 1000 20"
            preserveAspectRatio="none"
            height="20"
            aria-hidden
            fill="none"
          >
            <path
              d="M60 10 H940"
              stroke="hsl(var(--brand-accent))"
              strokeWidth="3"
              strokeDasharray="1 14"
              strokeLinecap="round"
            />
          </svg>

          <ol className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <li key={step.title} className="relative flex flex-col items-center text-center">
                <div className="relative flex h-14 w-14 items-center justify-center rounded-full border-4 border-tropical-deep bg-tropical-accent text-white shadow-sketch">
                  <step.icon className="h-6 w-6" aria-hidden />
                  <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white font-urbanist text-[11px] font-black text-tropical-dark">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-4 font-urbanist text-lg font-extrabold text-white">{step.title}</h3>
                <p className="mt-2 text-sm text-tropical-surface/75">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
