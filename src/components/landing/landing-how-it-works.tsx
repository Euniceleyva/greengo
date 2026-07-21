 "use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { usePublicLocale } from "@/components/shared/public-locale";

const STEPS = [
  ["01", "Elige tu trayecto", "Choose your route", "Origen, destino y el ritmo de tu plan.", "Pickup, destination, and the pace of your plans."],
  ["02", "Confirma en minutos", "Confirm in minutes", "Datos claros, tarifa visible y atención cercana.", "Clear details, visible pricing, and attentive support."],
  ["03", "Nos vemos al llegar", "Meet us on arrival", "Tu conductor te espera y el descanso empieza.", "Your driver is waiting, and relaxation begins."],
];

export function LandingHowItWorks() {
  const { text } = usePublicLocale();
  return (
    <section id="como-funciona" className="mkt-night overflow-hidden px-5 py-24 sm:px-8 lg:px-12 lg:py-36">
      <div className="mx-auto max-w-[1480px]">
        <div className="grid gap-12 lg:grid-cols-[1fr_.9fr] lg:items-center">
          <div data-reveal><p className="mkt-eyebrow text-[var(--mkt-gold)]">{text("Cuando cae el sol", "When the sun goes down")}</p><h2 className="mt-5 max-w-3xl font-heading text-5xl font-medium leading-[.92] tracking-[-.045em] sm:text-7xl">{text("De la calma del día a una noche que promete.", "From a calm day to a promising night.")}</h2><p className="mt-7 max-w-xl text-base leading-8 text-white/60">{text("Cena frente al mar, cocktails, música y beach clubs. Sal, disfruta y vuelve con la misma comodidad con la que llegaste.", "Dinner by the sea, cocktails, music, and beach clubs. Go out, enjoy, and return with the same comfort you arrived in.")}</p><Link href="/reservar?serviceType=transporte_abierto" className="mt-9 inline-flex items-center gap-3 border-b border-[var(--mkt-gold)] pb-2 text-sm text-white">{text("Organizar una noche", "Plan a night out")} <ArrowRight className="h-4 w-4" /></Link></div>
          <div data-reveal className="relative ml-auto aspect-[4/5] w-[88%] max-w-xl"><Image data-parallax src="/images/gallery/6.webp" alt="Vida nocturna sofisticada en la Riviera Maya" fill sizes="50vw" className="scale-110 object-cover" /><div className="absolute -bottom-8 -left-10 hidden w-48 border border-white/20 bg-[var(--mkt-night)] p-5 lg:block"><p className="font-heading text-2xl text-[var(--mkt-gold)]">Dinner<br/>& dancing</p><p className="mt-3 text-[10px] uppercase tracking-[.16em] text-white/45">Sin preocuparte por volver</p></div></div>
        </div>
        <div className="mt-28 grid border-t border-white/20 lg:grid-cols-3">
          {STEPS.map(([n,titleEs,titleEn,copyEs,copyEn], i) => <div data-reveal key={n} className={`py-8 lg:px-8 ${i ? "border-t border-white/20 lg:border-l lg:border-t-0" : ""}`}><span className="text-xs text-[var(--mkt-gold)]">{n}</span><h3 className="mt-6 font-heading text-3xl font-medium">{text(titleEs,titleEn)}</h3><p className="mt-3 max-w-xs text-sm leading-6 text-white/50">{text(copyEs,copyEn)}</p></div>)}
        </div>
      </div>
    </section>
  );
}
