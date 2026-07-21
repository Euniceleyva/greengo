import type { Metadata, Viewport } from "next";
import { Bungee, Inter, Nunito_Sans, Poppins } from "next/font/google";
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

const adventureDisplay = Bungee({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-adventure-display",
  display: "swap",
});

const adventureBody = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-adventure-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: "GreenGo Traslados — DEMO",
  description:
    "DEMO frontend de gestión y monitoreo de traslados turísticos en Cancún. Datos simulados.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
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
