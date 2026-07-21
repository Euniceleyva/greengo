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
    <section data-adventure-reveal className="adventure-gallery overflow-hidden px-4 py-20 sm:px-6 sm:py-28 lg:px-10">
      <div className="mx-auto max-w-[1280px]">
        <div className="adventure-section-heading">
          <div data-reveal-item className="adventure-stamp adventure-stamp--passport">RIVIERA<br />MAYA</div>
          <div data-reveal-item>
            <h2>La ventana ya es parte del viaje.</h2>
            <p>Mar turquesa, selva y carretera. Estos son algunos de los paisajes que empiezan antes de llegar.</p>
          </div>
          <p data-reveal-item className="adventure-margin-note">Vistas reales de nuestras rutas favoritas.</p>
        </div>
        <div data-reveal-item data-postcard className="adventure-carousel-frame mt-10">
          <div className="adventure-tape" aria-hidden />
          <Carousel slides={slides} ariaLabel="Galería de fotos de Cancún y la Riviera Maya" />
          <span className="adventure-photo-caption">Kilómetro cero: Caribe Mexicano</span>
        </div>
      </div>
    </section>
  );
}
