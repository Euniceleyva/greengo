"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, ListChecks, Fuel, AlertTriangle, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

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

  return (
    <div className="flex min-h-screen justify-center bg-slate-100">
      {/* Contenedor tipo teléfono en pantallas grandes */}
      <div className="relative flex min-h-screen w-full max-w-md flex-col bg-background shadow-xl">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-primary px-4 text-primary-foreground">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-sm font-bold">GG</div>
            <span className="text-sm font-semibold">GreenGo · Conductor</span>
          </div>
          <button onClick={() => router.push("/")} aria-label="Salir" className="rounded-md p-1.5 hover:bg-white/15">
            <LogOut className="h-5 w-5" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto px-4 pb-24 pt-4">{children}</main>

        {/* Navegación inferior */}
        <nav className="fixed bottom-0 z-30 w-full max-w-md border-t border-border bg-card">
          <div className="grid grid-cols-5">
            {NAV.map((item) => {
              const active = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <Icon className={cn("h-5 w-5", active && "fill-primary/10")} />
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
