"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { ClipboardCheck, CircleUserRound, Fuel, House, LogOut, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSessionStore } from "@/stores/session-store";
import { useDemoStore } from "@/stores/demo-store";
import { useHydrated } from "@/lib/hooks";
import { DEFAULT_DRIVER_ID } from "@/mocks/users";
import { getLicenseNotice } from "@/lib/driver-compliance";

const NAV = [
  { href: "/driver/home", label: "Inicio", icon: House },
  { href: "/driver/services", label: "Servicios", icon: ClipboardCheck },
  { href: "/driver/fuel", label: "Gasolina", icon: Fuel },
  { href: "/driver/incidents", label: "Incidencia", icon: TriangleAlert },
  { href: "/driver/profile", label: "Perfil", icon: CircleUserRound },
];

export function DriverShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const hydrated = useHydrated();
  const currentUser = useSessionStore((s) => s.currentUser);
  const drivers = useDemoStore((s) => s.drivers);
  const driverName = hydrated ? currentUser?.name.split(" ")[0] ?? "Conductor" : "Conductor";
  const activeDriverId = currentUser?.driverId ?? DEFAULT_DRIVER_ID;
  const activeDriver = drivers.find((driver) => driver.id === activeDriverId);
  const licenseNotice = activeDriver ? getLicenseNotice(activeDriver.licenseExpiresOn) : null;

  return (
    <div className="flex min-h-screen justify-center bg-muted">
      {/* Contenedor tipo teléfono en pantallas grandes */}
      <div className="relative flex min-h-screen w-full max-w-md flex-col bg-background shadow-xl ring-1 ring-border">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-primary/20 bg-primary px-4 text-primary-foreground">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-28 shrink-0 items-center justify-center rounded-lg bg-white px-2 ring-1 ring-black/10">
              <Image
                src="/images/logos/logo_color.png"
                alt="GreenGo Transfers Cancún"
                width={132}
                height={58}
                className="h-7 w-auto"
                priority
              />
            </div>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-[11px] font-medium uppercase tracking-wide text-primary-foreground/70">Conductor</p>
              <p className="font-heading truncate text-sm font-semibold">{driverName}</p>
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
        <nav className="fixed bottom-0 z-30 w-full max-w-md border-t border-border bg-card/95 pb-safe shadow-popover backdrop-blur">
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
                    "flex min-h-[58px] flex-col items-center justify-center gap-1 py-2 text-[11px] font-semibold transition-colors",
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "relative flex h-8 w-12 items-center justify-center rounded-full transition-colors",
                      active ? "bg-primary text-primary-foreground shadow-soft" : "bg-transparent",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.href === "/driver/profile" && licenseNotice && (
                      <span className="absolute right-1 top-0 h-2.5 w-2.5 rounded-full bg-warning ring-2 ring-card" />
                    )}
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
