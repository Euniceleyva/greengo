import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { ReservationWizard } from "@/components/reservar/reservation-wizard";
import { Skeleton } from "@/components/ui/misc";

export const metadata: Metadata = {
  title: "Reservar traslado — GreenGo Traslados",
  description: "Cotiza y reserva tu traslado turístico en Cancún y la Riviera Maya en unos minutos.",
};

export default function ReservarPage() {
  return (
    <div className="min-h-screen bg-tropical-surface font-urbanist paper-texture">
      <header className="border-b-2 border-dashed border-tropical-border bg-tropical-background">
        <div className="mx-auto flex h-16 max-w-3xl items-center px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="GreenGo Transfers Cancún" width={40} height={34} className="h-9 w-auto" priority />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 pb-32 sm:px-6 sm:py-14 sm:pb-32">
        <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
          <ReservationWizard />
        </Suspense>
      </main>
    </div>
  );
}
