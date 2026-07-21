import Image from "next/image";
import { Check } from "lucide-react";
import { Carousel } from "@/components/ui/carousel";
import { GALLERY_IMAGES } from "@/mocks/gallery";

const REASONS: { text: string; tone: "green" | "blue" }[] = [
  { text: "Llegamos cuando nos necesites", tone: "green" },
  { text: "Cuidamos tu equipaje como si fuera nuestro", tone: "blue" },
  { text: "Conductores que conocen cada ruta", tone: "green" },
  { text: "Unidades limpias y verificadas", tone: "blue" },
  { text: "Tarifa clara, sin sorpresas", tone: "green" },
  { text: "Soporte en español e inglés, siempre disponible", tone: "blue" },
];

export function LandingGallery() {
  const slides = GALLERY_IMAGES.map((img, i) => (
    <div key={img.id} className="relative aspect-[16/9] w-full">
      <Image
        src={img.src}
        alt={img.alt}
        fill
        priority={i === 0}
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 90vw, 560px"
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

        <div className="adventure-gallery-split mt-12">
          <div data-reveal-item data-postcard className="adventure-carousel-frame">
            <div className="adventure-tape" aria-hidden />
            <Carousel slides={slides} ariaLabel="Galería de fotos de Cancún y la Riviera Maya" />
            <span className="adventure-photo-caption">Kilómetro cero: Caribe Mexicano</span>
          </div>

          <div data-reveal-item className="adventure-reasons">
            <p className="adventure-reasons__kicker">¿Por qué viajar con nosotros?</p>
            <ul className="adventure-reason-list">
              {REASONS.map((reason) => (
                <li key={reason.text} className="adventure-reason">
                  <span className={`adventure-reason__icon adventure-reason__icon--${reason.tone}`}>
                    <Check aria-hidden />
                  </span>
                  <span>{reason.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
