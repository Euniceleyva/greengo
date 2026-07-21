import type { Metadata } from "next";
import { CheckoutClient } from "@/components/pago/checkout-client";
import { PublicSubpageHeader } from "@/components/shared/public-subpage-header";
import { LocalizedPageIntro } from "@/components/shared/localized-page-intro";

export const metadata: Metadata = {
  title: "Pago — Marea",
  description: "Pasarela de pago simulada del DEMO. No se procesa ningún pago real.",
};

export default function CheckoutPage() {
  return (
    <div className="public-theme min-h-screen bg-[var(--mkt-bg)]">
      <PublicSubpageHeader backHref="/reservar" backLabel="Volver a reserva" />

      <main className="mx-auto max-w-3xl px-5 py-12 pb-32 sm:px-8 lg:py-20">
        <LocalizedPageIntro eyebrow="Último paso" eyebrowEn="Final step" title="Confirma tu llegada." titleEn="Confirm your arrival." copy="Revisa el trayecto y elige cómo completar tu reserva." copyEn="Review your trip and choose how to complete your booking." />
        <CheckoutClient />
      </main>
    </div>
  );
}
