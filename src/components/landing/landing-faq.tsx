import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { SectionHeading } from "@/components/landing/ui/section-heading";
import { FAQ_ITEMS } from "@/mocks/faq";

export function LandingFaq() {
  return (
    <section className="bg-tropical-surface py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="dudas antes de zarpar"
          title="Preguntas frecuentes"
          description="Resolvemos las dudas más comunes sobre tu traslado."
        />

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
