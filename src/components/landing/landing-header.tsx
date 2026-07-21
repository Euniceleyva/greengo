"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/#servicios", label: "Servicios" },
  { href: "/#destinos", label: "Destinos" },
  { href: "/#como-funciona", label: "El viaje" },
  { href: "/#contacto", label: "Contacto" },
];

export function LandingHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <header className="fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-5 sm:pt-5">
      <div
        className={cn(
          "mx-auto flex h-16 max-w-[88rem] items-center justify-between border px-4 transition-all duration-300 sm:px-6",
          scrolled || mobileOpen
            ? "border-[hsl(var(--marketing-line))] bg-[hsl(var(--marketing-paper)/.94)] text-[hsl(var(--marketing-ink))] shadow-[0_14px_50px_hsl(var(--marketing-shadow)/.12)] backdrop-blur-xl"
            : "border-[hsl(var(--marketing-paper)/.2)] bg-[hsl(var(--marketing-ink)/.24)] text-[hsl(var(--marketing-paper))] backdrop-blur-md",
        )}
      >
        <Link href="/" aria-label="Atria Transfers, inicio" className="flex items-baseline gap-2">
          <span className="text-lg font-bold tracking-[-0.04em]">ATRIA</span>
          <span className="text-[0.65rem] font-medium uppercase tracking-[0.22em] opacity-65">Cancún</span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Navegación principal">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-xs font-medium tracking-wide opacity-75 transition-opacity hover:opacity-100">
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/reservar"
          className={cn(
            "hidden min-h-11 items-center gap-2 px-5 text-sm font-medium transition duration-200 hover:-translate-y-0.5 active:translate-y-0 sm:flex",
            scrolled ? "bg-[hsl(var(--marketing-ink))] text-[hsl(var(--marketing-paper))]" : "bg-[hsl(var(--marketing-paper))] text-[hsl(var(--marketing-ink))]",
          )}
        >
          Reservar <ArrowUpRight className="h-4 w-4" aria-hidden />
        </Link>

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center lg:hidden"
          aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          onClick={() => setMobileOpen((value) => !value)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <nav id="mobile-nav" aria-label="Navegación móvil" className="mx-auto max-w-[88rem] border-x border-b border-[hsl(var(--marketing-line))] bg-[hsl(var(--marketing-paper))] p-4 text-[hsl(var(--marketing-ink))] lg:hidden">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="flex min-h-12 items-center border-b border-[hsl(var(--marketing-line))] text-base">
              {link.label}
            </Link>
          ))}
          <Link href="/reservar" className="mt-4 flex min-h-12 items-center justify-between bg-[hsl(var(--marketing-ink))] px-4 text-[hsl(var(--marketing-paper))]">
            Reservar traslado <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </nav>
      )}
    </header>
  );
}
