"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function LoginForm({ accessDenied = false }: { accessDenied?: boolean }) {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState(
    accessDenied ? "Esta cuenta no tiene permiso para consultar el panel." : "",
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (signInError) {
      setError("El correo o la contraseña no son correctos.");
      setIsSubmitting(false);
      return;
    }

    router.replace("/admon");
    router.refresh();
  }

  return (
    <main className="operations-theme relative min-h-screen overflow-hidden bg-background px-4 py-8 sm:px-6">
      <div className="absolute inset-x-0 top-0 flex h-1.5" aria-hidden>
        <span className="w-[55%] bg-primary" />
        <span className="w-[27%] bg-info" />
        <span className="flex-1 bg-warning" />
      </div>
      <div className="pointer-events-none absolute -left-32 top-16 h-80 w-80 rounded-full border border-info/20" aria-hidden />
      <div className="pointer-events-none absolute -left-20 top-28 h-56 w-56 rounded-full border border-info/30" aria-hidden />

      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center gap-10 lg:grid-cols-[1fr_430px]">
        <section className="hidden max-w-xl lg:block" aria-labelledby="access-heading">
          <div className="flex items-center gap-4">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white p-2 shadow-card ring-1 ring-border">
              <Image
                src="/images/logos/logo_anterior_color.png"
                alt="GreenGo Transfers"
                width={551}
                height={453}
                className="h-full w-full object-contain"
                priority
              />
            </div>
            <span className="h-14 w-px bg-border" aria-hidden />
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Control de reservaciones
            </p>
          </div>
          <h1 id="access-heading" className="mt-8 max-w-lg text-4xl font-bold leading-tight text-foreground">
            La operación del día,<br />en un solo lugar.
          </h1>
          <p className="mt-4 max-w-md text-base leading-7 text-muted-foreground">
            Consulta servicios, recorridos e ingresos y descarga reportes del periodo que necesites.
          </p>
          <div className="mt-9 flex items-center gap-3 text-sm font-semibold text-foreground">
            <span className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_0_5px_hsl(var(--primary)/0.16)]" />
            Acceso exclusivo para administración
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-white p-6 shadow-card sm:p-8" aria-labelledby="login-title">
          <div className="mb-7 flex items-center gap-4 lg:hidden">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white p-1.5 shadow-soft ring-1 ring-border">
              <Image
                src="/images/logos/logo_anterior_color.png"
                alt="GreenGo Transfers"
                width={551}
                height={453}
                className="h-full w-full object-contain"
                priority
              />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              Control de reservaciones
            </p>
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Cuenta administrativa</p>
          <h2 id="login-title" className="mt-2 text-2xl font-bold text-foreground">Entrar al panel</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Usa el correo y la contraseña asignados a administración.
          </p>

          <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
            <label className="block text-sm font-bold text-foreground">
              Correo electrónico
              <span className="relative mt-2 block">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-12 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm font-medium text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="administracion@empresa.com"
                />
              </span>
            </label>

            <label className="block text-sm font-bold text-foreground">
              Contraseña
              <span className="relative mt-2 block">
                <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-12 w-full rounded-xl border border-input bg-background pl-10 pr-12 text-sm font-medium text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="Tu contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </span>
            </label>

            {error && (
              <div role="alert" className="rounded-xl border border-warning/35 bg-warning-soft px-4 py-3 text-sm font-semibold text-foreground">
                {error}
              </div>
            )}

            <Button type="submit" size="lg" disabled={isSubmitting} className="w-full rounded-xl font-bold">
              {isSubmitting && <LoaderCircle className="animate-spin" />}
              {isSubmitting ? "Verificando acceso" : "Entrar al panel"}
            </Button>
          </form>

          <p className="mt-6 border-t border-border pt-5 text-center text-xs leading-5 text-muted-foreground">
            Si olvidaste tu contraseña, solicita el restablecimiento al responsable de la cuenta.
          </p>
        </section>
      </div>
    </main>
  );
}
