"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bus, Menu, X, RotateCcw, Bell, LogOut } from "lucide-react";
import { ADMIN_NAV } from "./nav";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { useDemoStore } from "@/stores/demo-store";
import { useSessionStore } from "@/stores/session-store";
import { MOCK_USERS } from "@/mocks/users";
import { useHydrated } from "@/lib/hooks";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [confirmReset, setConfirmReset] = React.useState(false);
  const resetDemo = useDemoStore((s) => s.resetDemo);
  const pendingAlerts = useDemoStore((s) =>
    s.alerts.filter((a) => a.status === "pendiente").length,
  );
  const sessionUser = useSessionStore((s) => s.currentUser);
  const hydrated = useHydrated();
  const user = hydrated ? sessionUser ?? MOCK_USERS[0] : MOCK_USERS[0];

  const handleReset = () => {
    resetDemo();
    setConfirmReset(false);
    toast.success("Datos del DEMO restablecidos a su estado original.");
  };

  return (
    <div className="flex min-h-screen bg-secondary/40">
      {/* Sidebar desktop */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Sidebar móvil */}
      <Dialog open={mobileOpen} onClose={() => setMobileOpen(false)} side className="max-w-[16rem]">
        <SidebarContent pathname={pathname} onNavigate={() => setMobileOpen(false)} />
      </Dialog>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border bg-card/90 px-4 backdrop-blur">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu />
          </Button>
          <div className="flex-1" />

          <Link href="/admin/alerts" className="relative">
            <Button variant="ghost" size="icon" aria-label="Alertas">
              <Bell />
            </Button>
            {hydrated && pendingAlerts > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                {pendingAlerts}
              </span>
            )}
          </Link>

          <Button variant="outline" size="sm" onClick={() => setConfirmReset(true)}>
            <RotateCcw />
            <span className="hidden sm:inline">Restablecer DEMO</span>
          </Button>

          <div className="flex items-center gap-2 pl-1">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white"
              style={{ backgroundColor: user.avatarColor }}
            >
              {user.name.split(" ").slice(0, 2).map((n) => n[0]).join("")}
            </span>
            <div className="hidden text-right sm:block">
              <p className="text-xs font-medium leading-tight">{user.name}</p>
              <p className="text-[10px] capitalize text-muted-foreground">{user.role}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/")}
              aria-label="Salir"
            >
              <LogOut />
            </Button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>
      </div>

      <Dialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Restablecer datos del DEMO"
        description="Se descartarán todos los cambios locales (viajes creados, estados, combustible, alertas revisadas, etc.) y los datos volverán a su estado original."
      >
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setConfirmReset(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleReset}>
            <RotateCcw />
            Restablecer
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

function SidebarContent({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="flex h-16 items-center gap-2 border-b border-border px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Bus className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold leading-tight">GreenGo</p>
          <p className="text-[10px] text-muted-foreground">Panel administrativo</p>
        </div>
        {onNavigate && (
          <Button variant="ghost" size="icon" className="ml-auto" onClick={onNavigate} aria-label="Cerrar">
            <X />
          </Button>
        )}
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {ADMIN_NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-3">
        <p className="rounded-md bg-secondary px-3 py-2 text-[11px] text-muted-foreground">
          DEMO con datos simulados. Sin backend ni GPS real.
        </p>
      </div>
    </>
  );
}
