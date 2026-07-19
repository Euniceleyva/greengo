import Image from "next/image";
import { Carousel } from "@/components/ui/carousel";
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
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
          Cancún y la Riviera Maya
        </h2>
        <p className="mt-3 text-base text-muted-foreground">
          Un vistazo a los destinos que recorremos todos los días.
        </p>
      </div>
      <div className="mt-10">
        <Carousel slides={slides} ariaLabel="Galería de fotos de Cancún y la Riviera Maya" />
      </div>
    </section>
  );
}
