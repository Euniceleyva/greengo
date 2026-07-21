import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { FAQ_ITEMS } from "@/mocks/faq";

export function LandingFaq() {
  return (
    <section className="px-5 py-32 sm:px-8 md:py-48">
      <div className="mx-auto grid max-w-[1180px] gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
        <div>
          <h2 className="text-[clamp(3rem,6vw,6rem)] font-black leading-[0.9] tracking-[-0.065em]">Lo único que debería sorprenderte es el paisaje.</h2>
          <p className="mt-7 max-w-sm text-lg font-medium leading-relaxed text-[#55706c]">Aquí despejamos lo práctico para que llegues con la mente puesta en vacaciones.</p>
        </div>

        <div>
          <Accordion className="overflow-hidden rounded-[2rem] border-[#132e2a]/15 bg-white shadow-[0_24px_70px_rgba(19,46,42,0.08)]" defaultOpenId={FAQ_ITEMS[0]?.id}>
            {FAQ_ITEMS.map((faq) => (
              <AccordionItem key={faq.id} id={faq.id} question={faq.question} answer={faq.answer} />
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
