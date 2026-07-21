"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/landing/ui/public-controls";
import { PalmDoodle, SunDoodle, StickerBadge } from "@/components/landing/decor/decorations";

export function LandingCtaFinal() {
  const router = useRouter();

  return (
    <section className="relative overflow-hidden bg-gradient-tropical py-16 text-center sm:py-24">
      <PalmDoodle className="pointer-events-none absolute -left-6 -top-4 h-40 w-32 text-white/15 sm:h-48 sm:w-40" />
      <SunDoodle className="animate-float-soft-slow pointer-events-none absolute -right-2 bottom-2 h-24 w-24 text-white/20 sm:h-28 sm:w-28" />

      <div className="relative mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <StickerBadge tone="accent" className="mb-4">
          ¡Buen viaje!
        </StickerBadge>
        <h2 className="font-urbanist text-3xl font-black text-white sm:text-4xl">
          Tus vacaciones en Cancún empiezan con un buen traslado
        </h2>
        <p className="mx-auto mt-4 max-w-md font-hand text-2xl text-white/90">
          cotiza en minutos y deja que nosotros nos encarguemos del camino.
        </p>
        <div className="mt-8">
          <Button size="lg" variant="accent" onClick={() => router.push("/reservar")}>
            Reservar mi traslado
          </Button>
        </div>
      </div>
    </section>
  );
}
