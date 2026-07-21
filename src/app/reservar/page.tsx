import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ReservationWizard } from "@/components/reservar/reservation-wizard";
import { Skeleton } from "@/components/ui/misc";

export const metadata: Metadata = {
  title: "Reservar traslado — Atria Transfers",
  description: "Cotiza y reserva tu traslado turístico en Cancún y la Riviera Maya en unos minutos.",
};

export default function ReservarPage() {
  return (
    <div className="marketing-theme min-h-[100dvh] bg-[hsl(var(--marketing-canvas))]">
      <header className="border-b border-[hsl(var(--marketing-line))] bg-[hsl(var(--marketing-paper))]">
        <div className="mx-auto flex h-20 max-w-[88rem] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" aria-label="Atria Transfers, inicio" className="flex items-baseline gap-2"><span className="text-lg font-bold tracking-[-0.04em]">ATRIA</span><span className="text-[0.65rem] uppercase tracking-[0.22em] opacity-60">Cancún</span></Link>
          <Link href="/" className="flex min-h-11 items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--marketing-ink))]"><ArrowLeft className="h-4 w-4" /> Volver</Link>
        </div>
      </header>

      <main className="mx-auto grid max-w-[88rem] gap-12 px-4 py-14 pb-32 sm:px-6 md:py-20 lg:grid-cols-12 lg:px-8">
        <aside className="lg:col-span-4">
          <p className="text-xs uppercase tracking-[0.2em] text-[hsl(var(--marketing-clay))]">Reserva privada</p>
          <h1 className="marketing-display mt-5 text-balance text-5xl font-medium leading-[0.9] tracking-[-0.045em] sm:text-6xl">Tu llegada, resuelta desde ahora.</h1>
          <p className="mt-7 max-w-sm text-sm leading-6 text-[hsl(var(--muted-foreground))]">Completa los datos a tu ritmo. Verás el desglose antes de continuar al pago.</p>
        </aside>
        <div className="lg:col-span-8">
          <Suspense fallback={<Skeleton className="h-96 w-full rounded-none" />}><ReservationWizard /></Suspense>
        </div>
      </main>
    </div>
  );
}
