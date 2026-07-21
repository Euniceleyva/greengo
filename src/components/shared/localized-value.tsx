"use client";

import { usePublicLocale } from "./public-locale";

export function LocalizedText({ es, en }: { es: string; en: string }) {
  const { text } = usePublicLocale();
  return <>{text(es, en)}</>;
}

export function LocalizedMoney({ amount, sourceCurrency = "MXN" }: { amount: number; sourceCurrency?: "MXN" | "USD" }) {
  const { money } = usePublicLocale();
  return <>{money(amount, sourceCurrency)}</>;
}
