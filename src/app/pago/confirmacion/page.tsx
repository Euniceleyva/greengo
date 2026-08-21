import type { Metadata } from "next";
import { ConfirmationClient } from "@/components/pago/confirmation-client";
import { LanguageSwitch, PublicLanguageProvider } from "@/components/shared/public-language";
import { Logo } from "@/components/landing/ui/logo";

export const metadata: Metadata = {
  title: "Reservación recibida — GreenGo Transfers Cancún",
  description: "Confirmación de recepción de tu reservación con GreenGo Transfers Cancún.",
};

type ConfirmacionPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ConfirmacionPage({ searchParams }: ConfirmacionPageProps) {
  const query = await searchParams;
  const reference = typeof query.reference === "string" ? query.reference : undefined;
  const paymentReturn = typeof query.return === "string" ? query.return : undefined;

  return (
    <PublicLanguageProvider>
    <div className="adventure-theme adventure-confirmation-page min-h-screen">
      <header className="adventure-confirmation__header">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center px-4 sm:px-6">
          <Logo variant="dark" imgClassName="h-8 w-auto sm:h-9" />
          <div className="ml-auto flex items-center gap-3">
            <span className="adventure-confirmation__status">SOLICITUD RECIBIDA</span>
            <LanguageSwitch compact />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 pb-32 sm:px-6 sm:py-12 sm:pb-32">
        <ConfirmationClient paymentReference={reference} paymentReturn={paymentReturn} />
      </main>
    </div>
    </PublicLanguageProvider>
  );
}
