import type { Metadata, Viewport } from "next";
import { Poppins, Inter, Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { WhatsAppSticky } from "@/components/shared/whatsapp-sticky";
import { ChatbotWidgetLazy } from "@/components/shared/chatbot-widget-lazy";
import { PublicLocaleProvider } from "@/components/shared/public-locale";

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

const fontMarketingDisplay = Fraunces({
  subsets: ["latin"],
  variable: "--font-marketing-display",
  display: "swap",
});

const fontMarketingBody = Manrope({
  subsets: ["latin"],
  variable: "--font-marketing-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: "Marea — Traslados en Cancún y Riviera Maya",
  description:
    "DEMO frontend de gestión y monitoreo de traslados turísticos en Cancún. Datos simulados.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#123B47",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={cn(fontHeading.variable, fontBody.variable, fontMarketingDisplay.variable, fontMarketingBody.variable)}>
      <body className="font-sans antialiased">
        <PublicLocaleProvider>
          {children}
          <WhatsAppSticky />
          <ChatbotWidgetLazy />
        </PublicLocaleProvider>
      </body>
    </html>
  );
}
