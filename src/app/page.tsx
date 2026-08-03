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
import { WHATSAPP_DISPLAY } from "@/constants";
import { DESTINATIONS } from "@/mocks/destinations";
import { FAQ_ITEMS } from "@/mocks/faq";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://greengotransfers.com";

export const metadata: Metadata = {
  title: "Traslados privados en Cancún sin esperas ni sorpresas",
  description:
    "Reserva transporte privado desde el Aeropuerto de Cancún a hoteles, tours y destinos de la Riviera Maya. Tarifa clara, seguimiento de vuelo y atención por WhatsApp.",
  openGraph: {
    title: "Traslados privados en Cancún sin esperas ni sorpresas | GreenGo Transfers",
    description:
      "Transporte privado desde el Aeropuerto de Cancún, rutas hotel a hotel, tours, tarifa clara y atención por WhatsApp.",
    images: ["/images/destinations/cancun.webp"],
    locale: "es_MX",
    type: "website",
  },
};

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": `${siteUrl}/#business`,
        name: "GreenGo Transfers Cancún",
        description:
          "Traslados privados desde el Aeropuerto de Cancún a hoteles, playas, parques y destinos de la Riviera Maya.",
        url: `${siteUrl}/`,
        telephone: WHATSAPP_DISPLAY,
        areaServed: ["Cancún", "Riviera Maya", "Playa del Carmen", "Tulum", "Isla Mujeres", "Cozumel", "Xcaret"],
        image: `${siteUrl}/images/destinations/cancun.webp`,
        priceRange: "$$",
        sameAs: [],
        makesOffer: [
          "Traslado Aeropuerto de Cancún a hotel",
          "Traslado hotel a hotel",
          "Transporte privado con chofer",
          "Transporte para grupos y eventos",
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${siteUrl}/#destinations`,
        name: "Destinos de traslado en Cancún y Riviera Maya",
        itemListElement: DESTINATIONS.map((destination, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: destination.name,
          url: `${siteUrl}/destinos/${destination.slug}`,
        })),
      },
      {
        "@type": "FAQPage",
        "@id": `${siteUrl}/#faq`,
        mainEntity: FAQ_ITEMS.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
    ],
  };

  return (
    <PublicLanguageProvider>
    <div className="adventure-theme min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
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
