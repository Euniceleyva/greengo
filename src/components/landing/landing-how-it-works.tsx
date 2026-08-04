import { ClipboardList, CalendarCheck, CarFront, PartyPopper } from "lucide-react";

const STEPS = [
  {
    icon: ClipboardList,
    title: "Cotiza tu ruta",
    description: "Indica origen, destino, fecha, horario, pasajeros y equipaje para calcular tu traslado privado.",
  },
  {
    icon: CalendarCheck,
    title: "Confirma con tarifa clara",
    description: "Revisa los detalles del servicio antes de reservar y evita sorpresas al llegar a Cancún.",
  },
  {
    icon: CarFront,
    title: "Tu conductor te espera",
    description: "Te recibimos en el aeropuerto, hotel o punto acordado, con seguimiento de vuelo cuando aplica.",
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
            <p className="adventure-kicker">Reserva en línea</p>
            <h2>Cómo reservar tu traslado privado en Cancún.</h2>
          </div>
          <p data-reveal-item>Un proceso simple para viajar del Aeropuerto de Cancún a tu hotel, tour o destino con conductor asignado y soporte por WhatsApp.</p>
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
