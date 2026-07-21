import type { Metadata } from "next";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingGalleryLazy } from "@/components/landing/landing-gallery-lazy";
import { LandingServices } from "@/components/landing/landing-services";
import { LandingDestinations } from "@/components/landing/landing-destinations";
import { LandingHowItWorks } from "@/components/landing/landing-how-it-works";
import { LandingTestimonials } from "@/components/landing/landing-testimonials";
import { LandingFaq } from "@/components/landing/landing-faq";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingMotion } from "@/components/landing/landing-motion";
import { PublicLanguageProvider } from "@/components/shared/public-language";

export const metadata: Metadata = {
  title: "Marea Club — Tu aventura comienza en el camino",
  description:
    "Traslados turísticos en Cancún y la Riviera Maya: aeropuerto, hotel a hotel, transporte abierto y soluciones a medida. Cotiza y reserva en minutos.",
  openGraph: {
    title: "Marea Club — Traslados en Cancún y Riviera Maya",
    description:
      "Traslados turísticos en Cancún y la Riviera Maya: aeropuerto, hotel a hotel, transporte abierto y soluciones a medida.",
    images: ["/images/destinations/cancun.jpg"],
    locale: "es_MX",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <PublicLanguageProvider>
    <div className="adventure-theme min-h-screen bg-background">
      <LandingMotion>
        <LandingHeader />
        <main>
          <LandingHero />
          <LandingGalleryLazy />
          <LandingServices />
          <LandingDestinations />
          <LandingHowItWorks />
          <LandingTestimonials />
          <LandingFaq />
        </main>
        <LandingFooter />
      </LandingMotion>
    </div>
    </PublicLanguageProvider>
  );
}
