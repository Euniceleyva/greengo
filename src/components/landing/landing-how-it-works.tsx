import { ClipboardList, CalendarCheck, CarFront, Waves } from "lucide-react";

const STEPS = [
  {
    icon: ClipboardList,
    title: "Dinos qué plan traes",
    description: "Comparte origen, destino, fecha y cuántos viajeros se suman a la aventura.",
    tone: "bg-[#c8f04b] text-[#132e2a]",
  },
  {
    icon: CalendarCheck,
    title: "Reserva sin dramas",
    description: "Revisa tu tarifa, confirma los detalles y deja el trayecto resuelto en minutos.",
    tone: "bg-[#0e9c9a] text-white",
  },
  {
    icon: CarFront,
    title: "Nos vemos al llegar",
    description: "Tu conductor te espera en el punto acordado y sigue tu vuelo cuando aplica.",
    tone: "bg-[#ff6b35] text-[#132e2a]",
  },
  {
    icon: Waves,
    title: "Ahora sí, a disfrutar",
    description: "Sube, relájate y guarda energía para lo que de verdad viniste a vivir.",
    tone: "bg-[#132e2a] text-white",
  },
];

export function LandingHowItWorks() {
  return (
    <section id="aventura" className="px-5 py-32 sm:px-8 md:py-48">
      <div className="mx-auto max-w-[1180px]">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <div className="lg:sticky lg:top-32 lg:h-fit">
            <h2 className="text-[clamp(3rem,6vw,6.2rem)] font-black leading-[0.9] tracking-[-0.065em]">De la maleta al mar, así de fácil.</h2>
            <p className="mt-7 max-w-sm text-lg font-medium leading-relaxed text-[#55706c]">Cuatro movimientos. Cero tiempo perdido improvisando transporte al aterrizar.</p>
          </div>

          <ol className="space-y-8 lg:space-y-28">
            {STEPS.map((step, i) => (
              <li key={step.title} data-stack-card className={`sticky top-28 flex min-h-[25rem] flex-col rounded-[2rem] p-8 shadow-[0_30px_70px_rgba(19,46,42,0.18)] sm:p-10 ${step.tone}`} style={{ top: `${7 + i * 1.25}rem` }}>
                <div className="flex items-start justify-between gap-4">
                  <step.icon className="h-10 w-10" strokeWidth={1.4} aria-hidden />
                  <span className="text-6xl font-black tracking-[-0.08em] opacity-25">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="mt-auto max-w-xl text-[clamp(2.3rem,5vw,4.6rem)] font-black leading-[0.92] tracking-[-0.06em]">{step.title}</h3>
                <p className="mt-5 max-w-lg text-base font-medium leading-relaxed opacity-75 sm:text-lg">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
