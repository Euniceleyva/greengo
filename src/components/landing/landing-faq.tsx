import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { FAQ_ITEMS } from "@/mocks/faq";

export function LandingFaq() {
  return (
    <section className="bg-[hsl(var(--marketing-paper))] px-4 py-32 sm:px-6 md:py-48 lg:px-8">
      <div className="mx-auto grid max-w-[88rem] gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h2 className="marketing-display text-balance text-[clamp(3.3rem,6vw,6.5rem)] font-medium leading-[0.86] tracking-[-0.05em]">Antes de salir, todo claro.</h2>
          <p className="mt-7 max-w-sm text-sm leading-6 text-[hsl(var(--muted-foreground))]">Respuestas directas sobre reservas, vuelos, equipaje y cambios de itinerario.</p>
        </div>
        <div className="lg:col-span-7 lg:pt-16">
          <Accordion className="divide-[hsl(var(--marketing-line))] rounded-none border-x-0 border-[hsl(var(--marketing-line))] bg-transparent">
            {FAQ_ITEMS.map((faq) => <AccordionItem key={faq.id} id={faq.id} question={faq.question} answer={faq.answer} />)}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
