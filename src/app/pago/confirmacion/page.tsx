import type { Metadata } from "next";
import Link from "next/link";
import { ConfirmationClient } from "@/components/pago/confirmation-client";
import { LanguageSwitch, PublicLanguageProvider } from "@/components/shared/public-language";

export const metadata: Metadata = {
  title: "Reservación confirmada — Marea Club",
  description: "Confirmación de la reservación simulada del DEMO.",
};

export default function ConfirmacionPage() {
  return (
    <PublicLanguageProvider>
    <div className="adventure-theme min-h-screen bg-surface-soft">
      <header className="adventure-reservation__header">
        <div className="mx-auto flex h-16 max-w-2xl items-center px-4 sm:px-6">
          <Link href="/" className="adventure-wordmark">Marea<span>Club</span></Link>
          <div className="ml-auto"><LanguageSwitch compact /></div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-10 pb-32 sm:px-6 sm:py-14 sm:pb-32">
        <ConfirmationClient />
      </main>
    </div>
    </PublicLanguageProvider>
  );
}
