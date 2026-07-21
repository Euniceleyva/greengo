import Image from "next/image";
import { GALLERY_IMAGES } from "@/mocks/gallery";

export function LandingGallery() {
  return (
    <section className="bg-[hsl(var(--marketing-canvas))] px-4 pb-20 pt-32 sm:px-6 md:pb-32 md:pt-48 lg:px-8">
      <div className="mx-auto max-w-[88rem]">
        <h2 className="marketing-display max-w-6xl text-balance text-[clamp(3.2rem,6.6vw,7rem)] font-medium leading-[0.88] tracking-[-0.05em]">
          Del vuelo <span className="relative mx-1 inline-block h-[0.62em] w-[1.5em] overflow-hidden align-baseline sm:mx-3"><Image src={GALLERY_IMAGES[0].src} alt="" fill sizes="160px" className="object-cover" /></span> al mar, sin perder el ritmo.
        </h2>

        <div className="mt-20 grid gap-4 md:grid-cols-12 md:gap-6">
          <figure className="group md:col-span-8">
            <div className="relative aspect-[16/10] overflow-hidden"><Image data-motion-image src={GALLERY_IMAGES[1].src} alt={GALLERY_IMAGES[1].alt} fill sizes="(max-width: 768px) 100vw, 66vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-105" /></div>
            <figcaption className="mt-3 flex justify-between border-t border-[hsl(var(--marketing-line))] pt-3 text-xs text-[hsl(var(--muted-foreground))]"><span>Recepción privada</span><span>Cancún, Q. Roo</span></figcaption>
          </figure>
          <figure className="group md:col-span-4 md:pt-32">
            <div className="relative aspect-[4/5] overflow-hidden"><Image data-motion-image src={GALLERY_IMAGES[4].src} alt={GALLERY_IMAGES[4].alt} fill sizes="(max-width: 768px) 100vw, 34vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-105" /></div>
            <figcaption className="mt-3 border-t border-[hsl(var(--marketing-line))] pt-3 text-xs text-[hsl(var(--muted-foreground))]">Rutas hechas a tu medida</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
