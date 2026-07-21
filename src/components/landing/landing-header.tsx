"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { LanguageToggle, usePublicLocale } from "@/components/shared/public-locale";

export function LandingHeader() {
  const { text } = usePublicLocale();
  const NAV_LINKS = [
    { href: "/#servicios", label: text("Traslados", "Transfers") },
    { href: "/#destinos", label: text("Experiencias", "Experiences") },
    { href: "/#como-funciona", label: text("Cómo funciona", "How it works") },
    { href: "/#contacto", label: text("Contacto", "Contact") },
  ];
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 border-b transition-all duration-300", scrolled || mobileOpen ? "border-[var(--mkt-border)] bg-[var(--mkt-bg)]/95 text-[var(--mkt-ink)] backdrop-blur-md" : "border-white/20 bg-transparent text-white")}>
      <div className="mx-auto flex h-[76px] max-w-[1480px] items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link href="/" className="flex items-baseline gap-2" aria-label="Marea, inicio">
          <span className="font-heading text-[1.85rem] leading-none tracking-[-.04em]">Marea</span>
          <span className="hidden text-[9px] font-bold uppercase tracking-[.2em] opacity-70 sm:inline">Riviera Maya</span>
        </Link>
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Navegación principal">
          {NAV_LINKS.map((link) => <a key={link.href} href={link.href} className="mkt-link text-xs font-semibold uppercase tracking-[.12em]">{link.label}</a>)}
        </nav>
        <div className="hidden items-center gap-3 md:flex"><LanguageToggle inverse={!scrolled && !mobileOpen} /><Link href="/reservar" className={cn("min-h-11 items-center gap-3 border px-5 text-xs font-bold uppercase tracking-[.12em] transition-colors md:inline-flex", scrolled ? "border-[var(--mkt-ink)] hover:bg-[var(--mkt-ink)] hover:text-white" : "border-white/60 hover:bg-white hover:text-[var(--mkt-ink)]")}>{text("Reservar", "Book now")} <ArrowUpRight className="h-4 w-4" /></Link></div>
        <button type="button" className="flex h-11 w-11 items-center justify-center lg:hidden" onClick={() => setMobileOpen(v => !v)} aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"} aria-expanded={mobileOpen}>{mobileOpen ? <X /> : <Menu />}</button>
      </div>
      {mobileOpen && (
        <nav className="border-t border-[var(--mkt-border)] bg-[var(--mkt-bg)] px-5 pb-7 pt-4 text-[var(--mkt-ink)] lg:hidden">
          {NAV_LINKS.map((link) => <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="flex min-h-12 items-center border-b border-[var(--mkt-border)] font-heading text-xl">{link.label}</a>)}
          <div className="mt-5 flex items-center justify-between gap-3"><LanguageToggle /><Link href="/reservar" className="flex min-h-12 flex-1 items-center justify-between bg-[var(--mkt-ink)] px-4 text-sm font-bold uppercase tracking-wider text-white">{text("Reservar ahora", "Book now")} <ArrowUpRight className="h-4 w-4" /></Link></div>
        </nav>
      )}
    </header>
  );
}
