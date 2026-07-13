"use client";

// Sesión simulada: solo guarda el usuario "activo" seleccionado en la pantalla
// inicial. NO es autenticación real; no hay contraseñas ni verificación.

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DemoUser } from "@/types";

interface SessionState {
  currentUser: DemoUser | null;
  setUser: (user: DemoUser) => void;
  clear: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      currentUser: null,
      setUser: (user) => set({ currentUser: user }),
      clear: () => set({ currentUser: null }),
    }),
    { name: "greengo-session" },
  ),
);
