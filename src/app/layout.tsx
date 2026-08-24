import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
import { WhatsAppSticky } from "@/components/shared/whatsapp-sticky";
import { ChatbotWidgetLazy } from "@/components/shared/chatbot-widget-lazy";

// Fuentes autoalojadas (subset latin descargado de Google Fonts una sola vez,
// ver public/fonts/) para que `next build` no dependa de fonts.googleapis.com.
const fontHeading = localFont({
  src: [
    { path: "../../public/fonts/poppins-500.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/poppins-600.woff2", weight: "600", style: "normal" },
    { path: "../../public/fonts/poppins-700.woff2", weight: "700", style: "normal" },
    { path: "../../public/fonts/poppins-800.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-heading",
  display: "swap",
});

const fontBody = localFont({
  src: [
    { path: "../../public/fonts/inter-400.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/inter-500.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/inter-600.woff2", weight: "600", style: "normal" },
    { path: "../../public/fonts/inter-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-body",
  display: "swap",
});

// Tipografía del sitio público (Landing / Reservar / Pago / Destinos).
// Fredoka para titulares y acentos; Lexend para texto funcional/formularios.
const adventureDisplay = localFont({
  src: [
    { path: "../../public/fonts/fredoka-500.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/fredoka-600.woff2", weight: "600", style: "normal" },
    { path: "../../public/fonts/fredoka-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-adventure-display",
  display: "swap",
});

const adventureBody = localFont({
  src: [
    { path: "../../public/fonts/lexend-400.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/lexend-500.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/lexend-600.woff2", weight: "600", style: "normal" },
    { path: "../../public/fonts/lexend-700.woff2", weight: "700", style: "normal" },
    { path: "../../public/fonts/lexend-800.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-adventure-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://greengotransfers.com"),
  title: {
    default: "GreenGo Transfers Cancún | Traslados privados en Riviera Maya",
    template: "%s | GreenGo Transfers Cancún",
  },
  description:
    "Traslados privados desde el Aeropuerto de Cancún a hoteles, playas, parques y destinos de la Riviera Maya.",
  icons: {
    icon: "/images/logos/logo_anterior_color.png",
    shortcut: "/images/logos/logo_anterior_color.png",
    apple: "/images/logos/logo_anterior_color.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#29876B",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={cn(
        fontHeading.variable,
        fontBody.variable,
        adventureDisplay.variable,
        adventureBody.variable,
      )}
    >
      <body className="font-sans antialiased">
        {children}
        <WhatsAppSticky />
        <ChatbotWidgetLazy />
      </body>
    </html>
  );
}
