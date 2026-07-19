import type { GalleryImage } from "@/types";

// Imágenes del carrusel de la Landing Page. Todas son placeholders locales
// (ver /public/images/gallery) — deben reemplazarse por fotografía real de
// Cancún y la Riviera Maya antes de producción (ver README §17).
export const GALLERY_IMAGES: GalleryImage[] = [
  { id: "gallery-01", src: "/images/gallery/gallery-01.png", alt: "Playa de arena blanca en la Zona Hotelera de Cancún", width: 1600, height: 900 },
  { id: "gallery-02", src: "/images/gallery/gallery-02.png", alt: "Vista aérea de la costa turquesa de la Riviera Maya", width: 1600, height: 900 },
  { id: "gallery-03", src: "/images/gallery/gallery-03.png", alt: "Van de traslado turístico estacionada frente a un hotel", width: 1600, height: 900 },
  { id: "gallery-04", src: "/images/gallery/gallery-04.png", alt: "Ruinas mayas de Tulum frente al mar Caribe", width: 1600, height: 900 },
  { id: "gallery-05", src: "/images/gallery/gallery-05.png", alt: "Muelle y aguas cristalinas de Puerto Morelos", width: 1600, height: 900 },
  { id: "gallery-06", src: "/images/gallery/gallery-06.png", alt: "Calle peatonal de la Quinta Avenida en Playa del Carmen", width: 1600, height: 900 },
];
