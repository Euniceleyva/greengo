"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Menu,
  X,
  RotateCcw,
  Bell,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  Settings,
} from "lucide-react";
import { ADMIN_NAV, ADMIN_NAV_GROUPS } from "./nav";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/toast";
import { useDemoStore } from "@/stores/demo-store";
import { useSessionStore } from "@/stores/session-store";
import { MOCK_USERS } from "@/mocks/users";
import { useHydrated } from "@/lib/hooks";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);
  const [confirmReset, setConfirmReset] = React.useState(false);
  const resetDemo = useDemoStore((s) => s.resetDemo);
  const pendingAlerts = useDemoStore((s) =>
    s.alerts.filter((a) => a.status === "pendiente").length,
  );
  const sessionUser = useSessionStore((s) => s.currentUser);
  const hydrated = useHydrated();
  const user = hydrated ? sessionUser ?? MOCK_USERS[0] : MOCK_USERS[0];
  const currentSection = ADMIN_NAV.find((item) => pathname.startsWith(item.href));

  const handleReset = () => {
    resetDemo();
    setConfirmReset(false);
    toast.success("Datos del DEMO restablecidos a su estado original.");
  };

  return (
    <div className="flex min-h-screen bg-surface-soft">
      {/* Sidebar desktop */}
      <aside
        className={cn(
          "hidden shrink-0 flex-col border-r border-border bg-card transition-[width] duration-200 lg:flex",
          collapsed ? "w-[4.5rem]" : "w-64",
        )}
      >
        <SidebarContent pathname={pathname} collapsed={collapsed} />
        <div className="border-t border-border p-2">
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-md text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
          >
            {collapsed ? <ChevronsRight className="h-4 w-4" /> : <><ChevronsLeft className="h-4 w-4" /> Colapsar</>}
          </button>
        </div>
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

          <div className="min-w-0 flex-1">
            <p className="font-heading truncate text-sm font-semibold text-foreground sm:text-base">
              {currentSection?.label ?? "Panel administrativo"}
            </p>
          </div>

          <Link href="/admin/alerts" className="relative">
            <Button variant="ghost" size="icon" aria-label="Ver alertas pendientes">
              <Bell />
            </Button>
            {hydrated && pendingAlerts > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                {pendingAlerts}
              </span>
            )}
          </Link>

          <DropdownMenu
            trigger={
              <button
                className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Menú de cuenta y configuración"
              >
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: user.avatarColor }}
                >
                  {user.name.split(" ").slice(0, 2).map((n) => n[0]).join("")}
                </span>
                <span className="hidden text-left sm:block">
                  <span className="block text-xs font-medium leading-tight text-foreground">{user.name}</span>
                  <span className="block text-[10px] capitalize text-muted-foreground">{user.role}</span>
                </span>
              </button>
            }
          >
            <DropdownMenuLabel>Cuenta</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setConfirmReset(true)}>
              <RotateCcw /> Restablecer datos del DEMO
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/")} className="text-destructive [&_svg]:text-destructive">
              <LogOut /> Salir
            </DropdownMenuItem>
          </DropdownMenu>
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
  collapsed = false,
  onNavigate,
}: {
  pathname: string;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className={cn("flex h-16 items-center gap-2 border-b border-border px-5", collapsed && "justify-center px-2")}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white ring-1 ring-border">
          <Image src="/logo.png" alt="GreenGo" width={28} height={23} className="h-6 w-auto" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-heading truncate text-sm font-bold leading-tight">GreenGo</p>
            <p className="truncate text-[10px] text-muted-foreground">Panel administrativo</p>
          </div>
        )}
        {onNavigate && (
          <Button variant="ghost" size="icon" className="ml-auto" onClick={onNavigate} aria-label="Cerrar">
            <X />
          </Button>
        )}
      </div>
      <nav className="flex-1 space-y-4 overflow-y-auto p-3">
        {ADMIN_NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "group/nav relative flex items-center gap-3 rounded-lg border-l-[3px] px-3 py-2.5 text-sm font-medium transition-colors",
                      collapsed && "justify-center px-0",
                      active
                        ? "border-primary bg-primary-soft text-primary font-semibold"
                        : "border-transparent text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {collapsed && (
                      <span className="pointer-events-none absolute left-full z-50 ml-2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background opacity-0 shadow-popover transition-opacity duration-150 group-hover/nav:opacity-100">
                        {item.label}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      {!collapsed && (
        <div className="border-t border-border p-3">
          <p className="flex items-center gap-1.5 rounded-md bg-secondary px-3 py-2 text-[11px] text-muted-foreground">
            <Settings className="h-3 w-3 shrink-0" /> DEMO con datos simulados. Sin backend ni GPS real.
          </p>
        </div>
      )}
    </>
  );
}
