"use client";

import { useEffect, useState } from "react";

/**
 * Indica si el componente ya se montó en el cliente. Se usa para evitar
 * desajustes de hidratación con los stores persistidos en localStorage.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
