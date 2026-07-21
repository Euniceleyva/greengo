import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ReservationWizard } from "@/components/reservar/reservation-wizard";
import { Skeleton } from "@/components/ui/misc";

export const metadata: Metadata = {
  title: "Reserva tu ruta — Marea Club",
  description: "Cotiza y reserva tu traslado turístico en Cancún y la Riviera Maya en unos minutos.",
};

export default function ReservarPage() {
  return (
    <div className="adventure-theme adventure-reservation min-h-screen bg-surface-soft">
      <header className="adventure-reservation__header">
        <div className="mx-auto flex h-[72px] max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="adventure-wordmark">
            Marea<span>Club</span>
          </Link>
          <span className="adventure-reservation__route">CUN → TU AVENTURA</span>
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
  );
}
