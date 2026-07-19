"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Home, ListChecks, Fuel, AlertTriangle, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSessionStore } from "@/stores/session-store";
import { useHydrated } from "@/lib/hooks";

const NAV = [
  { href: "/driver/home", label: "Inicio", icon: Home },
  { href: "/driver/services", label: "Servicios", icon: ListChecks },
  { href: "/driver/fuel", label: "Gasolina", icon: Fuel },
  { href: "/driver/incidents", label: "Incidencia", icon: AlertTriangle },
  { href: "/driver/profile", label: "Perfil", icon: User },
];

export function DriverShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const hydrated = useHydrated();
  const currentUser = useSessionStore((s) => s.currentUser);
  const driverName = hydrated ? currentUser?.name.split(" ")[0] ?? "Conductor" : "Conductor";

  return (
    <div className="flex min-h-screen justify-center bg-muted">
      {/* Contenedor tipo teléfono en pantallas grandes */}
      <div className="relative flex min-h-screen w-full max-w-md flex-col bg-background shadow-xl">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-black/10 bg-primary px-4 text-primary-foreground">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white">
              <Image src="/logo.png" alt="GreenGo" width={24} height={20} className="h-5 w-auto" />
            </div>
            <div className="min-w-0 leading-tight">
              <p className="font-heading truncate text-sm font-semibold">GreenGo</p>
              <p className="truncate text-[11px] text-primary-foreground/80">{driverName} · Conductor</p>
            </div>
          </div>
          <button
            onClick={() => router.push("/demo")}
            aria-label="Salir de la sesión simulada"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto px-4 pb-28 pt-4">{children}</main>

        {/* Navegación inferior */}
        <nav className="fixed bottom-0 z-30 w-full max-w-md border-t border-border bg-card pb-safe">
          <div className="grid grid-cols-5">
            {NAV.map((item) => {
              const active = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-[52px] flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <span className={cn("flex h-7 w-11 items-center justify-center rounded-full", active && "bg-primary-soft")}>
                    <Icon className="h-5 w-5" />
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
