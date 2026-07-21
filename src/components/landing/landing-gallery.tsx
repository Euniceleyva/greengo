 "use client";

import Image from "next/image";
import { GALLERY_IMAGES } from "@/mocks/gallery";
import { usePublicLocale } from "@/components/shared/public-locale";

export function LandingGallery() {
  const { text } = usePublicLocale();
  const images = GALLERY_IMAGES.slice(0, 4);
  return (
    <section className="overflow-hidden px-5 py-24 sm:px-8 lg:px-12 lg:py-36">
      <div className="mx-auto max-w-[1480px]">
        <div data-reveal className="grid items-end gap-8 lg:grid-cols-[.85fr_1.15fr]">
          <div className="max-w-xl"><p className="mkt-eyebrow text-[var(--mkt-coral)]">{text("Después del aterrizaje", "After landing")}</p><h2 className="mt-4 font-heading text-5xl font-medium leading-[.95] tracking-[-.045em] sm:text-7xl">{text("Baja el ritmo.", "Slow down.")}<br/><span className="italic text-[var(--mkt-sea)]">{text("Ya estás aquí.", "You are here.")}</span></h2></div>
          <p className="max-w-lg border-l border-[var(--mkt-border)] pl-6 text-base leading-8 text-[var(--mkt-muted)] lg:justify-self-end">{text("La llegada deja de ser logística y se vuelve la primera escena del viaje: aire cálido, agua cerca y tiempo para disfrutar.", "Arrival stops being logistics and becomes the first scene of your trip: warm air, water nearby, and time to enjoy.")}</p>
        </div>
        <div className="mt-16 grid grid-cols-12 gap-3 sm:gap-5 lg:mt-24">
          <div data-reveal className="mkt-photo-frame relative col-span-12 aspect-[16/10] sm:col-span-8"><Image data-parallax src={images[0].src} alt={images[0].alt} fill sizes="70vw" className="scale-110 object-cover" /></div>
          <div data-reveal className="mkt-photo-frame relative col-span-8 col-start-5 mt-12 aspect-[3/4] sm:col-span-4 sm:col-start-auto sm:mt-28"><Image data-parallax src={images[1].src} alt={images[1].alt} fill sizes="35vw" className="scale-110 object-cover" /></div>
          <div data-reveal className="relative col-span-7 -mt-10 aspect-[4/5] sm:col-span-4 sm:-mt-20"><Image src={images[2].src} alt={images[2].alt} fill sizes="35vw" className="object-cover" /><span className="absolute -right-6 top-8 hidden bg-[var(--mkt-coral)] px-4 py-3 text-xs uppercase tracking-[.14em] text-white sm:block">{text("Sol · Mar · Tiempo", "Sun · Sea · Time")}</span></div>
          <div data-reveal className="mkt-photo-frame relative col-span-12 mt-8 aspect-[16/8] sm:col-span-7 sm:col-start-6 sm:mt-20"><Image src={images[3].src} alt={images[3].alt} fill sizes="60vw" className="object-cover" /></div>
        </div>
      </div>
    </section>
  );
}
