import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ConfirmationClient } from "@/components/pago/confirmation-client";

export const metadata: Metadata = {
  title: "Reservación confirmada — GreenGo Traslados",
  description: "Confirmación de la reservación simulada del DEMO.",
};

export default function ConfirmacionPage() {
  return (
    <div className="min-h-screen bg-tropical-surface font-urbanist paper-texture">
      <header className="border-b-2 border-dashed border-tropical-border bg-tropical-background">
        <div className="mx-auto flex h-16 max-w-2xl items-center px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="GreenGo Transfers Cancún" width={40} height={34} className="h-9 w-auto" priority />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-10 pb-32 sm:px-6 sm:py-14 sm:pb-32">
        <ConfirmationClient />
      </main>
    </div>
  );
}
