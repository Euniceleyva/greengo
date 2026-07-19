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

export const metadata: Metadata = {
  title: "GreenGo Traslados — Transporte turístico en Cancún",
  description:
    "Traslados turísticos en Cancún y la Riviera Maya: aeropuerto, hotel a hotel, transporte abierto y soluciones a medida. Cotiza y reserva en minutos.",
  openGraph: {
    title: "GreenGo Traslados — Transporte turístico en Cancún",
    description:
      "Traslados turísticos en Cancún y la Riviera Maya: aeropuerto, hotel a hotel, transporte abierto y soluciones a medida.",
    images: ["/images/hero-cancun.png"],
    locale: "es_MX",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
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
    </div>
  );
}
