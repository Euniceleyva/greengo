 "use client";

import Link from "next/link";
import { ArrowUpRight, Instagram, Mail, Phone } from "lucide-react";
import { WHATSAPP_DISPLAY } from "@/constants";
import { usePublicLocale } from "@/components/shared/public-locale";

export function LandingFooter() {
  const { text } = usePublicLocale();
  return (
    <footer id="contacto" className="mkt-night border-t border-white/15 px-5 pb-28 pt-16 sm:px-8 sm:pb-14 lg:px-12 lg:pt-24">
      <div className="mx-auto max-w-[1480px]">
        <div className="grid gap-14 border-b border-white/20 pb-16 lg:grid-cols-[1.5fr_.8fr_.8fr]">
          <div><p className="font-heading text-5xl tracking-[-.04em] sm:text-7xl">Marea</p><p className="mt-5 max-w-md text-sm leading-7 text-white/60">{text("Traslados privados entre el aeropuerto, la costa y todo lo que viniste a disfrutar.", "Private transfers between the airport, the coast, and everything you came to enjoy.")}</p></div>
          <div><p className="mkt-eyebrow text-[var(--mkt-gold)]">{text("Explora", "Explore")}</p><div className="mt-5 flex flex-col items-start gap-3 text-sm text-white/75"><a className="mkt-link" href="/#servicios">{text("Traslados", "Transfers")}</a><a className="mkt-link" href="/#destinos">{text("Experiencias", "Experiences")}</a><Link className="mkt-link" href="/reservar">{text("Reservar", "Book")}</Link><Link className="mkt-link opacity-50" href="/demo">Demo</Link></div></div>
          <div><p className="mkt-eyebrow text-[var(--mkt-gold)]">{text("Conversemos", "Let's talk")}</p><div className="mt-5 space-y-3 text-sm text-white/70"><p className="flex items-center gap-3"><Phone className="h-4 w-4" />{WHATSAPP_DISPLAY}</p><p className="flex items-center gap-3"><Mail className="h-4 w-4" />hola@marea.demo</p><a href="#" className="flex items-center gap-3"><Instagram className="h-4 w-4" />Instagram <ArrowUpRight className="h-3 w-3" /></a></div></div>
        </div>
        <div className="flex flex-col gap-2 pt-6 text-[10px] uppercase tracking-[.14em] text-white/35 sm:flex-row sm:justify-between"><p>© {new Date().getFullYear()} Marea Riviera Maya</p><p>{text("Experiencia demostrativa · precios simulados", "Demo experience · simulated pricing")}</p></div>
      </div>
    </footer>
  );
}
