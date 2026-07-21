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
import "@/components/landing/landing.css";

export const metadata: Metadata = {
  title: "GreenGo Traslados — Transporte turístico en Cancún",
  description:
    "Traslados turísticos en Cancún y la Riviera Maya: aeropuerto, hotel a hotel, transporte abierto y soluciones a medida. Cotiza y reserva en minutos.",
  openGraph: {
    title: "GreenGo Traslados — Transporte turístico en Cancún",
    description:
      "Traslados turísticos en Cancún y la Riviera Maya: aeropuerto, hotel a hotel, transporte abierto y soluciones a medida.",
    images: ["/images/destinations/cancun.jpg"],
    locale: "es_MX",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <div className="adventure-landing min-h-screen bg-[#f4f0e6] text-[#132e2a]">
      <LandingMotion />
      <LandingHeader />
      <main className="w-full max-w-full overflow-x-hidden">
        <LandingHero />
        <LandingServices />
        <LandingHowItWorks />
        <LandingDestinations />
        <LandingGalleryLazy />
        <LandingTestimonials />
        <LandingFaq />
      </main>
      <LandingFooter />
    </div>
  );
}
