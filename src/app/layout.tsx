import type { Metadata, Viewport } from "next";
import { Fredoka, Inter, Lexend, Poppins } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { WhatsAppSticky } from "@/components/shared/whatsapp-sticky";
import { ChatbotWidgetLazy } from "@/components/shared/chatbot-widget-lazy";

const fontHeading = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-heading",
  display: "swap",
});

const fontBody = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

// Tipografía del sitio público (Landing / Reservar / Pago / Destinos).
// Fredoka para titulares y acentos; Lexend para texto funcional/formularios.
const adventureDisplay = Fredoka({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-adventure-display",
  display: "swap",
});

const adventureBody = Lexend({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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
    icon: "/images/logos/favicon_greengo.png",
    shortcut: "/images/logos/favicon_greengo.png",
    apple: "/images/logos/favicon_greengo.png",
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
