"use client";

import { usePublicLocale } from "./public-locale";

export function LocalizedPageIntro({ eyebrow, eyebrowEn, title, titleEn, copy, copyEn }: { eyebrow: string; eyebrowEn: string; title: string; titleEn: string; copy?: string; copyEn?: string }) {
  const { text } = usePublicLocale();
  return <div className="mb-10 max-w-2xl"><p className="mkt-eyebrow text-[var(--mkt-coral)]">{text(eyebrow, eyebrowEn)}</p><h1 className="mt-4 font-heading text-5xl font-medium tracking-[-.045em] sm:text-7xl">{text(title, titleEn)}</h1>{copy && copyEn ? <p className="mt-4 max-w-lg text-sm leading-7 text-[var(--mkt-muted)]">{text(copy, copyEn)}</p> : null}</div>;
}
