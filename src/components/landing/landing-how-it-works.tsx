import { ClipboardList, CalendarCheck, CarFront, PartyPopper } from "lucide-react";

const STEPS = [
  {
    icon: ClipboardList,
    title: "Cotiza tu ruta",
  },
  {
    icon: CalendarCheck,
    title: "Confirma con tarifa clara",
  },
  {
    icon: CarFront,
    title: "Tu conductor te espera",
  },
  {
    icon: PartyPopper,
    title: "Disfruta el trayecto",
  },
];

export function LandingHowItWorks() {
  return (
    <section id="como-funciona" data-adventure-reveal className="adventure-itinerary py-20 sm:py-28">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
        <div className="adventure-itinerary__heading">
          <div data-reveal-item>
            <h2>Cómo reservar tu traslado privado en Cancún.</h2>
          </div>
        </div>

        <ol className="adventure-itinerary__steps mt-14">
          {STEPS.map((step) => (
            <li key={step.title} data-reveal-item>
              <div className="adventure-itinerary__marker">
                <step.icon className="h-6 w-6" aria-hidden />
              </div>
              <h3>{step.title}</h3>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
