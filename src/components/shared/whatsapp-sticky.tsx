"use client";

import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { useActiveSection } from "@/lib/hooks";
import { WHATSAPP_PHONE } from "@/constants";
import { usePublicLocale } from "./public-locale";

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
  const { locale } = usePublicLocale();
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
  const localizedHref = locale === "en"
    ? `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent("Hello, I would like to book a transfer in Cancun.")}`
    : href;

  return (
    <a
      href={localizedHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribir por WhatsApp"
      className={pathname.startsWith("/demo") ? "fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-success text-success-foreground shadow-popover transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:bottom-28 sm:right-6" : "fixed bottom-24 right-5 z-40 flex h-12 w-12 items-center justify-center border border-white/25 bg-[#b95f46] text-white shadow-popover transition-transform duration-200 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c4a162] sm:bottom-28 sm:right-6"}
    >
      <MessageCircle className={pathname.startsWith("/demo") ? "h-7 w-7" : "h-5 w-5"} aria-hidden />
    </a>
  );
}
