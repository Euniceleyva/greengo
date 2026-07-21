import type { Metadata } from "next";
import { ConfirmationClient } from "@/components/pago/confirmation-client";
import { LanguageSwitch, PublicLanguageProvider } from "@/components/shared/public-language";
import { Logo } from "@/components/landing/ui/logo";

export const metadata: Metadata = {
  title: "Reservación confirmada — GreenGo Transfers Cancún",
  description: "Confirmación de la reservación simulada del DEMO.",
};

export default function ConfirmacionPage() {
  return (
    <PublicLanguageProvider>
    <div className="adventure-theme adventure-confirmation-page min-h-screen">
      <header className="adventure-confirmation__header">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center px-4 sm:px-6">
          <Logo imgClassName="h-8 w-auto sm:h-9" />
          <div className="ml-auto flex items-center gap-3">
            <span className="adventure-confirmation__status">VIAJE CONFIRMADO</span>
            <LanguageSwitch compact />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 pb-32 sm:px-6 sm:py-12 sm:pb-32">
        <ConfirmationClient />
      </main>
    </div>
    </PublicLanguageProvider>
  );
}
