 "use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { FAQ_ITEMS } from "@/mocks/faq";
import { usePublicLocale } from "@/components/shared/public-locale";

const FAQ_EN = [
  ["How do I book a transfer?", "Complete the quick quote on the home page or select Book now. The process covers service, trip details, contact information, and payment confirmation."],
  ["What happens if my flight is delayed?", "We monitor the flight number provided with your booking. Your driver adjusts the pickup time to the actual arrival at no extra cost for reasonable delays."],
  ["Can I cancel or change my booking?", "Yes. Request a date, time, or destination change through WhatsApp at least 24 hours in advance."],
  ["Which payment methods do you accept?", "We accept credit or debit cards, OXXO payments, and SPEI transfers. This demo uses a simulated checkout and does not process real charges."],
  ["Are child seats available?", "You can request an infant or booster seat in the booking notes, subject to availability and at no extra cost."],
  ["How much luggage can I bring?", "Each passenger may bring one large suitcase and one carry-on. Add special or extra luggage in the trip details."],
  ["Does the price include tolls and parking?", "The quoted price includes tolls. Destination parking is paid by the passenger when applicable."],
  ["Do you provide transportation for large groups?", "Yes. Vans and sprinters are available. Select Custom solutions and our team will contact you with a tailored quote."],
];

export function LandingFaq() {
  const { text, locale } = usePublicLocale();
  return (
    <><section className="px-5 py-24 sm:px-8 lg:px-12 lg:py-36"><div className="mx-auto grid max-w-[1240px] gap-14 lg:grid-cols-[.72fr_1.28fr]"><div data-reveal><p className="mkt-eyebrow text-[var(--mkt-coral)]">{text("Antes de llegar", "Before you arrive")}</p><h2 className="mt-5 font-heading text-5xl font-medium tracking-[-.04em] sm:text-6xl">{text("Todo claro.", "Everything clear.")}<br/>{text("Desde ahora.", "From the start.")}</h2><p className="mt-5 max-w-sm text-sm leading-7 text-[var(--mkt-muted)]">{text("Respuestas sencillas sobre equipaje, horarios, vuelos y cambios de itinerario.", "Straightforward answers about luggage, schedules, flights, and itinerary changes.")}</p></div><div data-reveal className="border-t border-[var(--mkt-border)]"><Accordion>{FAQ_ITEMS.map((faq, i) => <AccordionItem key={faq.id} id={faq.id} question={locale === "es" ? faq.question : FAQ_EN[i][0]} answer={locale === "es" ? faq.answer : FAQ_EN[i][1]} />)}</Accordion></div></div></section>
    <section className="relative overflow-hidden px-5 py-28 text-white sm:px-8 lg:px-12 lg:py-40"><Image src="/images/destinations/cancun.webp" alt="Atardecer en Cancún" fill sizes="100vw" className="object-cover" /><div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,31,43,.78),rgba(8,31,43,.18))]"/><div data-reveal className="relative mx-auto max-w-[1480px]"><p className="mkt-eyebrow text-[var(--mkt-gold)]">{text("Tu escape comienza aquí", "Your escape starts here")}</p><h2 className="mt-5 max-w-3xl font-heading text-6xl font-medium leading-[.9] tracking-[-.05em] sm:text-8xl">{text("Deja el viaje en nuestras manos.", "Leave the journey in our hands.")}</h2><Link href="/reservar" className="mt-10 inline-flex min-h-14 items-center gap-8 bg-[var(--mkt-coral)] px-7 text-sm font-bold uppercase tracking-[.12em]">{text("Reservar traslado", "Book a transfer")} <ArrowRight className="h-5 w-5" /></Link></div></section></>
  );
}
