import { ArrowUpRight } from "lucide-react";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { WHATSAPP_PHONE } from "@/constants";
import { FAQ_ITEMS } from "@/mocks/faq";

export function LandingFaq() {
  return (
    <section id="preguntas" data-adventure-reveal className="adventure-faq scroll-mt-20 py-16 sm:py-24">
      <div className="adventure-faq__layout mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-10">
        <div data-reveal-item className="adventure-faq__intro">
          <h2>Respuestas claras antes de viajar.</h2>
          <p>Reservas, vuelos, pagos y cambios: lo esencial antes de confirmar tu traslado.</p>
        </div>

        <div data-reveal-item className="adventure-faq__accordion">
          <div className="adventure-faq__manifest">
            <span>Preguntas frecuentes</span>
            <strong>7 preguntas</strong>
          </div>
          <Accordion className="adventure-faq__list" defaultOpenId={FAQ_ITEMS[0]?.id}>
            {FAQ_ITEMS.map((faq) => (
              <AccordionItem key={faq.id} id={faq.id} question={faq.question} answer={faq.answer} />
            ))}
          </Accordion>
          <div className="adventure-faq__help">
            <p>¿No encontraste tu respuesta?</p>
            <a href={`https://wa.me/${WHATSAPP_PHONE}`} target="_blank" rel="noreferrer">
              Escríbenos por WhatsApp <ArrowUpRight aria-hidden />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
