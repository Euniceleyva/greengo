import { ClipboardList, CalendarCheck, CarFront, PartyPopper } from "lucide-react";

const STEPS = [
  {
    icon: ClipboardList,
    title: "Cotiza tu traslado privado",
    description: "Indica origen, destino, fecha, horario, pasajeros y equipaje en el formulario de reserva.",
  },
  {
    icon: CalendarCheck,
    title: "Confirma tu reservación",
    description: "Revisa la tarifa antes de pagar, comparte tus datos de contacto y recibe los detalles del servicio.",
  },
  {
    icon: CarFront,
    title: "Te recogemos a tiempo",
    description: "Tu conductor te espera en el punto acordado, con seguimiento de vuelo cuando aplica.",
  },
  {
    icon: PartyPopper,
    title: "Disfruta el trayecto",
    description: "Sube, ponte cómodo y llega seguro a tu destino. Nosotros nos ocupamos del camino.",
  },
];

export function LandingHowItWorks() {
  return (
    <section id="como-funciona" data-adventure-reveal className="adventure-itinerary py-20 sm:py-28">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
        <div className="adventure-itinerary__heading">
          <div data-reveal-item className="adventure-sticker adventure-sticker--sun">FÁCIL<br />FÁCIL</div>
          <div data-reveal-item>
            <p className="adventure-kicker">Tu itinerario</p>
            <h2>Reserva tu traslado privado en 4 pasos.</h2>
          </div>
          <p data-reveal-item>Un proceso claro para llegar del Aeropuerto de Cancún a tu hotel o destino con tarifa visible, conductor asignado y soporte por WhatsApp.</p>
        </div>

        <ol className="adventure-itinerary__steps mt-14">
          {STEPS.map((step, i) => (
            <li key={step.title} data-reveal-item>
              <div className="adventure-itinerary__marker">
                <span>{i + 1}</span>
                <step.icon className="h-6 w-6" aria-hidden />
              </div>
              <div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
