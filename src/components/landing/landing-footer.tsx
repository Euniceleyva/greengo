import Link from "next/link";
import { ArrowUpRight, Mail, Phone } from "lucide-react";
import { WHATSAPP_DISPLAY } from "@/constants";

export function LandingFooter() {
  return (
    <footer id="contacto" className="bg-[hsl(var(--marketing-ink))] px-4 pb-28 pt-28 text-[hsl(var(--marketing-paper))] sm:px-6 sm:pb-12 md:pt-40 lg:px-8">
      <div className="mx-auto max-w-[88rem]">
        <div className="grid gap-12 border-b border-[hsl(var(--marketing-paper)/.18)] pb-20 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-9">
            <h2 className="marketing-display max-w-5xl text-balance text-[clamp(3.5rem,7vw,7.4rem)] font-medium leading-[0.85] tracking-[-0.05em]">Tu lugar ya está listo.</h2>
            <Link href="/reservar" className="mt-10 inline-flex min-h-14 items-center gap-4 bg-[hsl(var(--marketing-brass))] px-7 font-semibold text-[hsl(var(--marketing-ink))] transition-transform hover:-translate-y-1 active:translate-y-0">Reservar traslado <ArrowUpRight className="h-5 w-5" aria-hidden /></Link>
          </div>
          <address className="space-y-4 text-sm not-italic text-[hsl(var(--marketing-paper)/.64)] lg:col-span-3">
            <p className="flex items-center gap-3"><Phone className="h-4 w-4 text-[hsl(var(--marketing-brass))]" aria-hidden />{WHATSAPP_DISPLAY}</p>
            <p className="flex items-center gap-3"><Mail className="h-4 w-4 text-[hsl(var(--marketing-brass))]" aria-hidden />contacto@atria.demo</p>
          </address>
        </div>

        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-5"><Link href="/" className="text-xl font-bold tracking-[-0.04em]">ATRIA</Link><p className="mt-3 max-w-xs text-sm leading-6 text-[hsl(var(--marketing-paper)/.48)]">Traslados privados en Cancún y la Riviera Maya.</p></div>
          <nav aria-label="Navegación del pie" className="flex flex-col items-start gap-3 text-sm text-[hsl(var(--marketing-paper)/.64)] lg:col-span-3"><a href="/#servicios" className="hover:text-[hsl(var(--marketing-paper))]">Servicios</a><a href="/#destinos" className="hover:text-[hsl(var(--marketing-paper))]">Destinos</a><Link href="/reservar" className="hover:text-[hsl(var(--marketing-paper))]">Reservar</Link></nav>
          <nav aria-label="Enlaces legales" className="flex flex-col items-start gap-3 text-sm text-[hsl(var(--marketing-paper)/.64)] lg:col-span-4"><span>Privacidad</span><span>Términos de servicio</span><Link href="/demo" className="text-[hsl(var(--marketing-paper)/.35)] hover:text-[hsl(var(--marketing-paper))]">Acceso al panel demo</Link></nav>
        </div>

        <div className="flex flex-col gap-2 border-t border-[hsl(var(--marketing-paper)/.18)] pt-6 text-xs text-[hsl(var(--marketing-paper)/.38)] sm:flex-row sm:justify-between"><p>Sitio demostrativo; precios y disponibilidad simulados.</p><p>© {new Date().getFullYear()} Atria Transfers</p></div>
      </div>
    </footer>
  );
}
