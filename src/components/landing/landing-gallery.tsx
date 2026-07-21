import Image from "next/image";
import { Carousel } from "@/components/ui/carousel";
import { SectionHeading } from "@/components/landing/ui/section-heading";
import { GALLERY_IMAGES } from "@/mocks/gallery";

export function LandingGallery() {
  const slides = GALLERY_IMAGES.map((img, i) => (
    <div key={img.id} className="relative aspect-[16/9] w-full">
      <Image
        src={img.src}
        alt={img.alt}
        fill
        priority={i === 0}
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1152px"
        className="object-cover"
      />
    </div>
  ));

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <SectionHeading
        eyebrow="del cuaderno de viaje"
        title="Cancún y la Riviera Maya"
        description="Un vistazo a los destinos que recorremos todos los días."
      />
      <div className="mt-10">
        <Carousel slides={slides} ariaLabel="Galería de fotos de Cancún y la Riviera Maya" />
      </div>
    </section>
  );
}
