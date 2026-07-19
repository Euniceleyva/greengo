import { ClipboardList, CalendarCheck, CarFront, PartyPopper } from "lucide-react";

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
    <section id="como-funciona" className="bg-surface-soft py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">Cómo funciona</h2>
          <p className="mt-3 text-base text-muted-foreground">Reservar tu traslado toma solo unos minutos.</p>
        </div>

        <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li key={step.title} className="relative flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-card">
                <step.icon className="h-6 w-6" aria-hidden />
              </div>
              <span className="mt-4 font-heading text-sm font-bold uppercase tracking-wide text-primary">
                Paso {i + 1}
              </span>
              <h3 className="mt-1 font-heading text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
