import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { FAQ_ITEMS } from "@/mocks/faq";

export function LandingFaq() {
  return (
    <section data-adventure-reveal className="adventure-faq py-20 sm:py-28">
      <div className="mx-auto grid max-w-[1100px] gap-10 px-4 sm:px-6 lg:grid-cols-[.8fr_1.2fr] lg:px-10">
        <div data-reveal-item>
          <div className="adventure-stamp adventure-stamp--passport">NO TE<br />PIERDAS</div>
          <h2>Antes de subir, despeja la ruta.</h2>
          <p>Equipaje, vuelos, horarios y cambios: aquí están las respuestas rápidas.</p>
        </div>

        <div data-reveal-item className="adventure-faq__accordion">
          <Accordion>
            {FAQ_ITEMS.map((faq) => (
              <AccordionItem key={faq.id} id={faq.id} question={faq.question} answer={faq.answer} />
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
