"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { MOCK_LOGIN_CREDENTIALS, MOCK_LOGIN_PASSWORD, MOCK_USERS } from "@/mocks/users";
import { useSessionStore } from "@/stores/session-store";
import type { DemoUser } from "@/types";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";

export default function DemoLoginPage() {
  const router = useRouter();
  const setUser = useSessionStore((s) => s.setUser);
  const [email, setEmail] = useState(MOCK_USERS[0].email);
  const [password, setPassword] = useState(MOCK_LOGIN_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);

  const enter = (user: DemoUser) => {
    setUser(user);
    router.push(user.role === "conductor" ? "/driver/home" : "/admin/dashboard");
  };

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    const credential = MOCK_LOGIN_CREDENTIALS.find(
      (item) => item.email.toLowerCase() === normalizedEmail && item.password === password,
    );
    const user = credential ? MOCK_USERS.find((item) => item.id === credential.userId) : null;

    if (!user) {
      toast.warning("Correo o contraseña incorrectos para el DEMO.");
      return;
    }

    toast.success(`Bienvenido, ${user.name.split(" ")[0]}.`);
    enter(user);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#edf5f3]">
      <Image
        src="/images/destinations/cancun.webp"
        alt=""
        fill
        sizes="100vw"
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,32,27,0.18)_0%,rgba(237,245,243,0.2)_42%,rgba(7,32,27,0.52)_100%)]" />
      <div className="absolute inset-0 backdrop-blur-[1px]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">
        <section className="w-full max-w-[440px] rounded-[1.65rem] border border-white/65 bg-white/[0.84] p-5 shadow-[0_28px_90px_rgba(8,34,29,0.34)] backdrop-blur-2xl sm:p-6">
          <div className="mb-7 text-center">
            <Image
              src="/images/logos/logo_color.png"
              alt="GreenGo Transfers Cancún"
              width={210}
              height={92}
              className="mx-auto h-16 w-auto"
              priority
            />
            <h1 className="mt-5 font-heading text-2xl font-bold text-foreground">
              Iniciar sesión
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Acceso mock para panel y conductor.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Correo</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="usuario@greengo.demo"
                  className="h-12 rounded-xl border-white/70 bg-white/70 pl-9 shadow-soft backdrop-blur"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Contraseña"
                  className="h-12 rounded-xl border-white/70 bg-white/70 pl-9 pr-11 shadow-soft backdrop-blur"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white hover:text-foreground"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" size="lg" className="h-12 w-full rounded-xl text-base shadow-card">
              Entrar <ArrowRight />
            </Button>
          </form>

          <p className="mt-5 text-center text-[11px] text-muted-foreground">
            Demo sin backend real · contraseña:{" "}
            <span className="font-semibold text-foreground">{MOCK_LOGIN_PASSWORD}</span>
          </p>
        </section>
      </div>
    </main>
  );
}
