"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LanguageToggle, usePublicLocale } from "./public-locale";

export function PublicSubpageHeader({ backHref = "/", backLabel = "Volver al inicio" }: { backHref?: string; backLabel?: string }) {
  const { text } = usePublicLocale();
  const translatedBack = backLabel === "Volver a reserva" ? text("Volver a reserva", "Back to booking") : text("Volver al inicio", "Back home");
  return <header className="border-b border-[var(--mkt-border)] bg-[var(--mkt-bg)]"><div className="mx-auto flex h-20 max-w-5xl items-center justify-between gap-3 px-5 sm:px-8"><Link href="/" className="font-heading text-3xl tracking-[-.04em]">Marea</Link><div className="flex items-center gap-3"><LanguageToggle /><Link href={backHref} className="mkt-link hidden items-center gap-2 text-xs font-bold uppercase tracking-[.12em] text-[var(--mkt-muted)] sm:flex"><ArrowLeft className="h-4 w-4" />{translatedBack}</Link></div></div></header>;
}
