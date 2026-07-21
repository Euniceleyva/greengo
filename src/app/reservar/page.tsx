import type { Metadata } from "next";
import { Suspense } from "react";
import { ReservationWizard } from "@/components/reservar/reservation-wizard";
import { Skeleton } from "@/components/ui/misc";
import { LanguageSwitch, PublicLanguageProvider } from "@/components/shared/public-language";
import { Logo } from "@/components/landing/ui/logo";

export const metadata: Metadata = {
  title: "Reserva tu ruta — GreenGo Transfers Cancún",
  description: "Cotiza y reserva tu traslado turístico en Cancún y la Riviera Maya en unos minutos.",
};

export default function ReservarPage() {
  return (
    <PublicLanguageProvider>
    <div className="adventure-theme adventure-reservation min-h-screen bg-surface-soft">
      <header className="adventure-reservation__header">
        <div className="mx-auto flex h-[72px] max-w-5xl items-center justify-between px-4 sm:px-6">
          <Logo imgClassName="h-8 w-auto sm:h-9" />
          <div className="flex items-center gap-3">
            <LanguageSwitch compact />
            <span className="adventure-reservation__route">CUN → TU AVENTURA</span>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-8 px-4 py-10 pb-32 sm:px-6 sm:py-14 sm:pb-32 lg:grid-cols-[260px_1fr]">
        <aside className="adventure-reservation__aside">
          <span>BOARDING PASS</span>
          <h1>Tu próximo plan empieza aquí.</h1>
          <p>Completa la ruta a tu ritmo. Guardamos los detalles mientras avanzas.</p>
          <div className="adventure-stamp adventure-stamp--sun">CUN<br />READY</div>
        </aside>
        <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
          <ReservationWizard />
        </Suspense>
      </main>
    </div>
    </PublicLanguageProvider>
  );
}
