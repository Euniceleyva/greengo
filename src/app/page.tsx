"use client";

import { useRouter } from "next/navigation";
import { Bus, ShieldCheck, Smartphone, MapPin, ArrowRight } from "lucide-react";
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
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-background to-background">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-4 py-12">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <Bus className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            GreenGo Traslados
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Gestión y monitoreo de traslados turísticos en Cancún · <span className="font-medium">DEMO</span>
          </p>
          <p className="mx-auto mt-2 max-w-xl text-xs text-muted-foreground">
            Selecciona con qué experiencia deseas entrar. Los usuarios son simulados y
            no requieren contraseña.
          </p>
        </div>

        <div className="grid w-full gap-5 sm:grid-cols-2">
          {/* Administrador / operador */}
          <Card className="flex flex-col p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold">Panel administrativo</h2>
                <p className="text-xs text-muted-foreground">Dueño · Administrador · Operador</p>
              </div>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              Servicios, monitoreo en tiempo real, vehículos, conductores, combustible,
              alertas, mantenimiento y reportes.
            </p>
            <div className="mt-auto space-y-2">
              {adminUsers.map((u) => (
                <UserButton key={u.id} user={u} onClick={() => enter(u)} />
              ))}
            </div>
          </Card>

          {/* Conductor */}
          <Card className="flex flex-col p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold">Experiencia del conductor</h2>
                <p className="text-xs text-muted-foreground">Optimizada para móvil</p>
              </div>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              Servicios del día, detalle de traslados, inicio y cierre de viaje, registro
              de gasolina, incidencias y perfil.
            </p>
            <div className="mt-auto space-y-2">
              <UserButton user={driverUser} onClick={() => enter(driverUser)} />
              <p className="flex items-center gap-1 pt-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" /> Sugerencia: ábrelo desde un teléfono o
                reduce la ventana.
              </p>
            </div>
          </Card>
        </div>

        <p className="mt-8 max-w-2xl text-center text-xs text-muted-foreground">
          Prototipo con datos simulados (mocks). No hay backend, base de datos, GPS real
          ni autenticación. Los cambios se guardan temporalmente en tu navegador.
        </p>
      </div>
    </main>
  );
}

function UserButton({ user, onClick }: { user: DemoUser; onClick: () => void }) {
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
        "group flex w-full items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:border-primary hover:bg-secondary",
      )}
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
        style={{ backgroundColor: user.avatarColor }}
      >
        {initials}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{user.name}</span>
        <span className="block text-xs text-muted-foreground">{roleLabel}</span>
      </span>
      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
    </button>
  );
}
