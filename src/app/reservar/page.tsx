import type { Metadata } from "next";
import { Suspense } from "react";
import { ReservationWizard } from "@/components/reservar/reservation-wizard";
import { Skeleton } from "@/components/ui/misc";
import { PublicSubpageHeader } from "@/components/shared/public-subpage-header";
import { LocalizedPageIntro } from "@/components/shared/localized-page-intro";

export const metadata: Metadata = {
  title: "Reservar traslado — Marea",
  description: "Cotiza y reserva tu traslado turístico en Cancún y la Riviera Maya en unos minutos.",
};

export default function ReservarPage() {
  return (
    <div className="public-theme min-h-screen bg-[var(--mkt-bg)]">
      <PublicSubpageHeader />

      <main className="mx-auto max-w-5xl px-5 py-12 pb-32 sm:px-8 lg:py-20">
        <LocalizedPageIntro eyebrow="Reserva privada" eyebrowEn="Private booking" title="El descanso empieza con el camino resuelto." titleEn="Relaxation starts with the journey handled." />
        <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
          <ReservationWizard />
        </Suspense>
      </main>
    </div>
  );
}
