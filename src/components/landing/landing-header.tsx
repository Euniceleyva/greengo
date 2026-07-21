"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/landing/ui/public-controls";
import { cn } from "@/lib/utils";

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
        "sticky top-0 z-40 w-full font-urbanist transition-colors duration-300",
        scrolled || mobileOpen
          ? "bg-tropical-background/95 shadow-sketch backdrop-blur supports-[backdrop-filter]:bg-tropical-background/85"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="GreenGo Transfers Cancún" width={44} height={37} className="h-10 w-auto" priority />
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Navegación principal">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="relative text-sm font-semibold text-tropical-text/80 transition-colors hover:text-tropical-primary"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button size="md" onClick={() => router.push("/reservar")}>
            Reservar ahora
          </Button>
        </div>

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-full text-tropical-text md:hidden"
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
          className="flex flex-col gap-1 border-t-2 border-dashed border-tropical-border bg-tropical-background px-4 pb-4 pt-2 md:hidden"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="flex min-h-[44px] items-center rounded-xl px-2 text-sm font-semibold text-tropical-text/80 hover:bg-tropical-primary/10 hover:text-tropical-primary"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/reservar"
            onClick={() => setMobileOpen(false)}
            className="mt-2 flex min-h-[44px] items-center justify-center rounded-full bg-gradient-tropical px-4 text-sm font-bold text-white shadow-sketch"
          >
            Reservar ahora
          </Link>
        </nav>
      )}
    </header>
  );
}
