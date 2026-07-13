"use client";

import { useSessionStore } from "@/stores/session-store";
import { DEFAULT_DRIVER_ID } from "@/mocks/users";

/** Id del conductor activo en la experiencia /driver (sesión simulada). */
export function useActiveDriverId(): string {
  const user = useSessionStore((s) => s.currentUser);
  return user?.driverId ?? DEFAULT_DRIVER_ID;
}
