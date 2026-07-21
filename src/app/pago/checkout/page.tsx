import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { CheckoutClient } from "@/components/pago/checkout-client";
import { LanguageSwitch, PublicLanguageProvider } from "@/components/shared/public-language";

export const metadata: Metadata = {
  title: "Pago seguro — Marea Club",
  description: "Pasarela de pago simulada del DEMO. No se procesa ningún pago real.",
};

export default function CheckoutPage() {
  return (
    <PublicLanguageProvider>
    <div className="adventure-theme adventure-checkout min-h-screen bg-surface-soft">
      <header className="adventure-checkout__header">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="adventure-wordmark" aria-label="Marea Club, inicio">
            Marea<span>Club</span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitch compact />
            <div className="adventure-checkout__secure"><LockKeyhole aria-hidden /> Pago protegido</div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 pb-32 sm:px-6 sm:py-12 sm:pb-32">
        <div className="adventure-checkout__intro">
          <Link href="/reservar" className="adventure-checkout__back">
            <ArrowLeft aria-hidden /> Volver a la reserva
          </Link>
          <div>
            <p>ÚLTIMA PARADA</p>
            <h1>Confirma y pon tu viaje en marcha.</h1>
          </div>
          <span className="adventure-stamp adventure-stamp--passport">CUN<br />PAGO</span>
        </div>
        <CheckoutClient />
      </main>
    </div>
    </PublicLanguageProvider>
  );
}
