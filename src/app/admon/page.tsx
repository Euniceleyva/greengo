import type { Metadata } from "next";
import { ServicesSummary } from "@/components/admon/services-summary";

export const metadata: Metadata = {
  title: "Resumen de servicios",
  description: "Consulta sencilla de reservaciones e ingresos de GreenGo Transfers.",
  robots: { index: false, follow: false },
};

export default function AdmonPage() {
  return (
    <main className="operations-theme min-h-screen bg-[radial-gradient(circle_at_top_right,hsl(var(--info)/0.16),transparent_34%),hsl(var(--background))]">
      <ServicesSummary />
    </main>
  );
}
