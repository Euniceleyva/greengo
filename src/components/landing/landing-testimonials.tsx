"use client";

import * as React from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import { TESTIMONIALS } from "@/mocks/testimonials";
import { SERVICE_TYPE_LABELS } from "@/constants";

export function LandingTestimonials() {
  const [active, setActive] = React.useState(0);
  const testimonial = TESTIMONIALS[active];

  const move = (direction: number) => {
    setActive((current) => (current + direction + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  return (
    <section className="bg-[#ff6b35] px-5 py-32 text-[#132e2a] sm:px-8 md:py-48">
      <div className="mx-auto grid max-w-[1180px] gap-14 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
        <div>
          <div className="flex items-center pl-4">
            {TESTIMONIALS.slice(0, 4).map((item, index) => (
              <button key={item.id} type="button" onClick={() => setActive(index)} aria-label={`Leer la experiencia de ${item.name}`} className={`relative -ml-4 h-20 w-20 overflow-hidden rounded-full border-4 border-[#ff6b35] transition-all duration-300 hover:scale-105 sm:h-24 sm:w-24 ${active === index ? "z-10 scale-105" : "opacity-75"}`}>
                <Image src={`/images/gallery/${index + 2}.jpg`} alt="" fill sizes="96px" className="object-cover" />
              </button>
            ))}
          </div>
          <p className="mt-7 max-w-xs text-base font-bold leading-relaxed">Viajeros que ya cambiaron el “¿cómo llegamos?” por un “¿qué hacemos después?”.</p>
        </div>

        <div aria-live="polite">
          <div className="flex gap-1" aria-label={`${testimonial.rating} de 5 estrellas`}>
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} className="h-5 w-5" fill={index < testimonial.rating ? "currentColor" : "none"} strokeWidth={1.5} aria-hidden />
            ))}
          </div>
          <blockquote className="mt-7 text-[clamp(2.3rem,5vw,5.4rem)] font-black leading-[0.98] tracking-[-0.06em]">
            “{testimonial.quote}”
          </blockquote>
          <div className="mt-10 flex flex-col justify-between gap-7 border-t-2 border-[#132e2a]/25 pt-6 sm:flex-row sm:items-center">
            <div>
              <p className="text-lg font-black">{testimonial.name}</p>
              <p className="text-sm font-semibold opacity-65">{testimonial.origin} · {SERVICE_TYPE_LABELS[testimonial.serviceType]}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => move(-1)} aria-label="Testimonio anterior" className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#132e2a] transition-transform hover:scale-105"><ArrowLeft className="h-5 w-5" aria-hidden /></button>
              <button type="button" onClick={() => move(1)} aria-label="Siguiente testimonio" className="flex h-12 w-12 items-center justify-center rounded-full bg-[#132e2a] text-white transition-transform hover:scale-105"><ArrowRight className="h-5 w-5" aria-hidden /></button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
