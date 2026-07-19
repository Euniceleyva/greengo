"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { ShieldCheck, Smartphone, ArrowRight, Sparkles } from "lucide-react";
import { MOCK_USERS } from "@/mocks/users";
import { useSessionStore } from "@/stores/session-store";
import type { DemoUser } from "@/types";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const router = useRouter();
  const setUser = useSessionStore((s) => s.setUser);

  const enter = (user: DemoUser) => {
    setUser(user);
    router.push(user.role === "conductor" ? "/driver/home" : "/admin/dashboard");
  };

  const adminUsers = MOCK_USERS.filter((u) => u.role !== "conductor");
  const driverUser = MOCK_USERS.find((u) => u.role === "conductor")!;

  return (
    <main className="route-pattern relative min-h-screen bg-gradient-to-b from-primary-soft via-background to-background">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-4 py-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-3xl bg-white shadow-card ring-1 ring-border">
            <Image src="/logo.png" alt="GreenGo Traslados" width={72} height={60} className="h-16 w-auto" priority />
          </div>
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-warning-soft px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-warning">
            <Sparkles className="h-3 w-3" /> Demo
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            GreenGo Traslados
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Gestión y monitoreo de traslados turísticos en Cancún.
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">
            ¿Con qué experiencia quieres entrar?
          </p>
        </div>

        <div className="grid w-full gap-5 sm:grid-cols-2">
          {/* Administrador / operador */}
          <Card className="flex flex-col overflow-hidden">
            <div className="h-1.5 w-full bg-primary" aria-hidden />
            <div className="flex flex-1 flex-col p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-heading font-semibold leading-tight">Panel administrativo</h2>
                  <p className="text-xs text-muted-foreground">Dueño · Administrador · Operador</p>
                </div>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">
                Servicios, monitoreo en tiempo real, flota, combustible, alertas y reportes.
              </p>
              <div className="mt-auto space-y-2">
                {adminUsers.map((u) => (
                  <UserButton key={u.id} user={u} cta="Entrar al panel" onClick={() => enter(u)} />
                ))}
              </div>
            </div>
          </Card>

          {/* Conductor */}
          <Card className="flex flex-col overflow-hidden">
            <div className="h-1.5 w-full bg-brand-orange" aria-hidden />
            <div className="flex flex-1 flex-col p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-warning-soft text-warning">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-heading font-semibold leading-tight">Aplicación del conductor</h2>
                  <p className="text-xs text-muted-foreground">Vista móvil · una mano</p>
                </div>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">
                Servicio activo, siguiente acción, registro de gasolina e incidencias.
              </p>
              <div className="mt-auto space-y-2">
                <UserButton user={driverUser} cta="Ver experiencia del conductor" onClick={() => enter(driverUser)} />
              </div>
            </div>
          </Card>
        </div>

        <p className="mt-6 max-w-xl text-center text-[11px] text-muted-foreground">
          Prototipo con datos simulados. Sin backend ni autenticación real — los cambios se guardan
          solo en este navegador.
        </p>
      </div>
    </main>
  );
}

function UserButton({
  user,
  cta,
  onClick,
}: {
  user: DemoUser;
  cta: string;
  onClick: () => void;
}) {
  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("");
  const roleLabel =
    user.role === "administrador"
      ? "Administrador"
      : user.role === "operador"
        ? "Operador"
        : "Conductor";
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      )}
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
        style={{ backgroundColor: user.avatarColor }}
      >
        {initials}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">{user.name}</span>
        <span className="block text-xs text-muted-foreground">
          {roleLabel} · <span className="font-medium text-primary">{cta}</span>
        </span>
      </span>
      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
    </button>
  );
}
