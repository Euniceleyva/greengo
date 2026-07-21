 "use client";

import { Star } from "lucide-react";
import { TESTIMONIALS } from "@/mocks/testimonials";
import { usePublicLocale } from "@/components/shared/public-locale";

const QUOTES_EN = [
  "Our driver met us in arrivals and took us straight to the Hotel Zone. Perfectly on time, and the vehicle was spotless.",
  "We booked a driver for the full day between Tulum and nearby cenotes. Total comfort, and our driver knew the area incredibly well.",
  "We coordinated a special wedding transfer and welcome pickup for our guests. Everything ran on time and without a hitch.",
];

export function LandingTestimonials() {
  const { text, locale } = usePublicLocale();
  return (
    <section className="bg-[var(--mkt-surface)] px-5 py-24 sm:px-8 lg:px-12 lg:py-36">
      <div className="mx-auto max-w-[1320px]">
        <div data-reveal className="grid gap-8 lg:grid-cols-[.6fr_1.4fr]"><p className="mkt-eyebrow pt-3 text-[var(--mkt-coral)]">{text("Viajeros en calma", "Travelers at ease")}</p><h2 className="font-heading text-5xl font-medium leading-[.96] tracking-[-.045em] sm:text-7xl">{text("“Por primera vez, el trayecto no se sintió como una espera.”", "“For once, the ride did not feel like waiting.”")}</h2></div>
        <div className="mt-16 grid border-t border-[var(--mkt-border)] md:grid-cols-3">
          {TESTIMONIALS.slice(0,3).map((t, i) => <figure data-reveal key={t.id} className={`py-8 md:px-8 ${i ? "border-t border-[var(--mkt-border)] md:border-l md:border-t-0" : ""}`}><div className="flex gap-1 text-[var(--mkt-gold)]" aria-label={`${t.rating} ${text("de 5 estrellas", "out of 5 stars")}`}>{Array.from({length: t.rating}).map((_,j)=><Star key={j} className="h-3.5 w-3.5 fill-current" />)}</div><blockquote className="mt-7 font-heading text-2xl leading-snug">“{locale === "es" ? t.quote : QUOTES_EN[i]}”</blockquote><figcaption className="mt-8 text-xs uppercase tracking-[.12em] text-[var(--mkt-muted)]">{t.name} · {t.origin}</figcaption></figure>)}
        </div>
      </div>
    </section>
  );
}
