"use client";

import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { useActiveSection } from "@/lib/hooks";
import { WHATSAPP_PHONE } from "@/constants";

const SECTION_MESSAGES: Record<string, string> = {
  servicios: "Hola, quiero más información sobre los tipos de servicio.",
  destinos: "Hola, quiero información sobre destinos.",
  "como-funciona": "Hola, tengo dudas sobre cómo funciona el servicio.",
  contacto: "Hola, quiero contactar a un asesor.",
};

const PATH_MESSAGES: { prefix: string; message: string }[] = [
  { prefix: "/reservar", message: "Hola, tengo dudas sobre mi reservación." },
  { prefix: "/pago", message: "Hola, tengo dudas sobre mi pago." },
  { prefix: "/destinos", message: "Hola, quiero información sobre un destino." },
];

const DEFAULT_MESSAGE = "Hola, quiero cotizar un traslado en Cancún.";

export function WhatsAppSticky() {
  const pathname = usePathname();
  const activeSectionId = useActiveSection(Object.keys(SECTION_MESSAGES));

  if (pathname.startsWith("/admin") || pathname.startsWith("/driver")) return null;

  let message = DEFAULT_MESSAGE;
  if (pathname === "/" && activeSectionId && SECTION_MESSAGES[activeSectionId]) {
    message = SECTION_MESSAGES[activeSectionId];
  } else {
    const match = PATH_MESSAGES.find((p) => pathname.startsWith(p.prefix));
    if (match) message = match.message;
  }

  const href = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribir por WhatsApp"
      className="fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-sketch transition-transform hover:scale-105 hover:rotate-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tropical-secondary focus-visible:ring-offset-2 motion-reduce:hover:rotate-0 sm:bottom-28 sm:right-6"
    >
      <MessageCircle className="h-7 w-7" aria-hidden />
    </a>
  );
}
