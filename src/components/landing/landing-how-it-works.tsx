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
    <section id="como-funciona" data-adventure-reveal className="adventure-itinerary py-20 sm:py-28">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
        <div className="adventure-itinerary__heading">
          <div data-reveal-item className="adventure-sticker adventure-sticker--sun">FÁCIL<br />FÁCIL</div>
          <div data-reveal-item>
            <p className="adventure-kicker">Tu itinerario</p>
            <h2>De “ya aterricé” a “ya llegué”.</h2>
          </div>
          <p data-reveal-item>Cuatro paradas claras, cero vueltas innecesarias.</p>
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
