import type { Metadata } from "next";
import { ConfirmationClient } from "@/components/pago/confirmation-client";
import { PublicSubpageHeader } from "@/components/shared/public-subpage-header";

export const metadata: Metadata = {
  title: "Reservación confirmada — Marea",
  description: "Confirmación de la reservación simulada del DEMO.",
};

export default function ConfirmacionPage() {
  return (
    <div className="public-theme min-h-screen bg-[var(--mkt-bg)]">
      <PublicSubpageHeader />

      <main className="mx-auto max-w-3xl px-5 py-12 pb-32 sm:px-8 lg:py-20">
        <ConfirmationClient />
      </main>
    </div>
  );
}
