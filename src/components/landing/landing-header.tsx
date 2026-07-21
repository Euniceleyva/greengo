"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "#servicios", label: "Servicios" },
  { href: "#destinos", label: "Destinos" },
  { href: "#aventura", label: "La experiencia" },
  { href: "#contacto", label: "Contacto" },
];

export function LandingHeader() {
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 w-full transition-all duration-300",
        scrolled || mobileOpen
          ? "py-2"
          : "bg-transparent",
      )}
    >
      <div className={cn("mx-auto flex h-16 max-w-[1380px] items-center justify-between px-5 transition-all sm:px-7", scrolled || mobileOpen ? "rounded-none bg-[#132e2a]/95 text-white shadow-2xl backdrop-blur-xl sm:rounded-full" : "text-[#132e2a]") }>
        <Link href="/" className="flex items-center gap-3" aria-label="GreenGo, inicio">
          <span className={cn("flex h-10 w-10 items-center justify-center rounded-full", scrolled || mobileOpen ? "bg-[#c8f04b]" : "bg-[#132e2a]") }>
            <Image src="/logo.png" alt="" width={32} height={27} className="h-7 w-auto" priority />
          </span>
          <span className="text-lg font-black tracking-[-0.04em]">GreenGo</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Navegación principal">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-semibold transition-opacity hover:opacity-60"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <Link href="/reservar" className="hidden min-h-11 items-center gap-2 rounded-full bg-[#c8f04b] px-5 text-sm font-black text-[#132e2a] transition-transform hover:scale-105 md:flex">
          Reservar viaje <ArrowUpRight className="h-4 w-4" aria-hidden />
        </Link>

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-full md:hidden"
          aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <nav
          id="mobile-nav"
          aria-label="Navegación móvil"
          className="mx-4 flex flex-col gap-1 rounded-b-3xl bg-[#132e2a] px-5 pb-5 pt-2 text-white shadow-2xl md:hidden"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="flex min-h-[44px] items-center rounded-xl px-2 text-sm font-semibold hover:bg-white/10"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/reservar"
            onClick={() => setMobileOpen(false)}
            className="mt-2 flex min-h-[48px] items-center justify-center rounded-full bg-[#c8f04b] px-4 text-sm font-black text-[#132e2a]"
          >
            Reservar ahora
          </Link>
        </nav>
      )}
    </header>
  );
}
