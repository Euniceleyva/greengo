import Image from "next/image";
import { GALLERY_IMAGES } from "@/mocks/gallery";

export function LandingGallery() {
  return (
    <section className="px-5 py-32 sm:px-8 md:py-48">
      <div className="mx-auto max-w-[1380px]">
        <h2 className="max-w-6xl text-[clamp(3rem,7.2vw,7.4rem)] font-black leading-[0.92] tracking-[-0.068em]">
          Personas reales, planes <span className="relative mx-2 inline-block h-[0.58em] w-[1.35em] overflow-hidden rounded-full align-[0.04em] sm:mx-4"><Image src="/images/gallery/4.jpg" alt="Amigas disfrutando su viaje" fill className="object-cover transition-transform duration-700 ease-out hover:scale-105" /></span> enormes y recuerdos que empiezan <span className="relative mx-2 inline-block h-[0.58em] w-[1.35em] overflow-hidden rounded-full align-[0.04em] sm:mx-4"><Image src="/images/gallery/1.jpg" alt="Bienvenida a bordo" fill className="object-cover transition-transform duration-700 ease-out hover:scale-105" /></span> a bordo.
        </h2>

        <div className="mt-20 grid grid-cols-2 gap-3 md:grid-cols-12 md:gap-5">
          {GALLERY_IMAGES.slice(0, 5).map((img, index) => (
            <div key={img.id} data-gsap-image className={`group relative overflow-hidden rounded-[1.5rem] ${index === 0 ? "col-span-2 aspect-[4/3] md:col-span-7 md:row-span-2 md:aspect-auto" : index === 1 ? "aspect-square md:col-span-5 md:aspect-[16/10]" : index === 2 ? "aspect-square md:col-span-5 md:aspect-[16/10]" : "aspect-[3/4] md:col-span-6 md:aspect-[16/10]"}`}>
              <Image src={img.src} alt={img.alt} fill sizes="(max-width: 768px) 50vw, 58vw" className="object-cover contrast-125 transition-transform duration-700 ease-out group-hover:scale-105" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
