import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { CheckoutClient } from "@/components/pago/checkout-client";

export const metadata: Metadata = {
  title: "Pago — GreenGo Traslados",
  description: "Pasarela de pago simulada del DEMO. No se procesa ningún pago real.",
};

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-surface-soft">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-2xl items-center px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="GreenGo Traslados" width={32} height={27} className="h-7 w-auto" priority />
            <span className="font-heading text-base font-bold text-foreground">GreenGo</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-10 pb-32 sm:px-6 sm:py-14 sm:pb-32">
        <CheckoutClient />
      </main>
    </div>
  );
}
