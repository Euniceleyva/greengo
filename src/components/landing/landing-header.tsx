"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LanguageSwitch } from "@/components/shared/public-language";

const NAV_LINKS = [
  { href: "#servicios", label: "Servicios" },
  { href: "#destinos", label: "Destinos" },
  { href: "#como-funciona", label: "Cómo funciona" },
  { href: "#contacto", label: "Contacto" },
];

export function LandingHeader() {
  const router = useRouter();
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
        "adventure-header sticky top-0 z-40 w-full transition-colors duration-200",
        scrolled || mobileOpen
          ? "adventure-header--scrolled"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-10">
        <Link href="/" className="adventure-wordmark" aria-label="Marea Club, inicio">
          Marea<span>Club</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Navegación principal">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="adventure-nav-link"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitch compact />
          <Button size="md" onClick={() => router.push("/reservar")} className="adventure-header-cta hidden md:inline-flex">
              Reservar <ArrowUpRight aria-hidden />
          </Button>
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center text-foreground md:hidden"
          aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          id="mobile-nav"
          aria-label="Navegación móvil"
          className="adventure-mobile-nav flex flex-col gap-1 px-4 pb-4 pt-2 md:hidden"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="flex min-h-[44px] items-center px-2 text-sm font-extrabold text-foreground/80 hover:text-primary"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/reservar"
            onClick={() => setMobileOpen(false)}
            className="adventure-cta mt-2 flex min-h-[44px] items-center justify-center px-4 text-sm font-extrabold"
          >
            Reservar ahora
          </Link>
        </nav>
      )}
    </header>
  );
}
