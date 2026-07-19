import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { FAQ_ITEMS } from "@/mocks/faq";

export function LandingFaq() {
  return (
    <section className="bg-surface-soft py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">Preguntas frecuentes</h2>
          <p className="mt-3 text-base text-muted-foreground">Resolvemos las dudas más comunes sobre tu traslado.</p>
        </div>

        <div className="mt-10">
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
