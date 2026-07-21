"use client";

import * as React from "react";

export type PublicLocale = "es" | "en";
const MXN_PER_USD = 17;

type LocaleContextValue = {
  locale: PublicLocale;
  setLocale: (locale: PublicLocale) => void;
  text: (es: string, en: string) => string;
  money: (amount: number, sourceCurrency?: "MXN" | "USD") => string;
};

const LocaleContext = React.createContext<LocaleContextValue | null>(null);

export function PublicLocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<PublicLocale>("es");

  React.useEffect(() => {
    const saved = window.localStorage.getItem("marea-locale");
    if (saved === "en" || saved === "es") setLocaleState(saved);
  }, []);

  React.useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = React.useCallback((next: PublicLocale) => {
    setLocaleState(next);
    window.localStorage.setItem("marea-locale", next);
  }, []);

  const value = React.useMemo<LocaleContextValue>(() => ({
    locale,
    setLocale,
    text: (es, en) => locale === "es" ? es : en,
    money: (amount, sourceCurrency = "MXN") => {
      const value = locale === "es"
        ? sourceCurrency === "USD" ? amount * MXN_PER_USD : amount
        : sourceCurrency === "MXN" ? amount / MXN_PER_USD : amount;
      return new Intl.NumberFormat(locale === "es" ? "es-MX" : "en-US", {
        style: "currency",
        currency: locale === "es" ? "MXN" : "USD",
        maximumFractionDigits: locale === "es" ? 0 : 2,
      }).format(value);
    },
  }), [locale, setLocale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function usePublicLocale() {
  const value = React.useContext(LocaleContext);
  if (!value) throw new Error("usePublicLocale must be used within PublicLocaleProvider");
  return value;
}

export function LanguageToggle({ inverse = false }: { inverse?: boolean }) {
  const { locale, setLocale } = usePublicLocale();
  return (
    <div className={`inline-flex items-center border text-[10px] font-bold tracking-[.14em] ${inverse ? "border-white/35 text-white" : "border-[var(--mkt-border)] text-[var(--mkt-ink)]"}`} aria-label="Language / Idioma">
      {(["es", "en"] as const).map((item) => (
        <button key={item} type="button" onClick={() => setLocale(item)} aria-pressed={locale === item} className={`min-h-9 px-2.5 uppercase transition-colors sm:px-3 ${locale === item ? inverse ? "bg-white text-[var(--mkt-ink)]" : "bg-[var(--mkt-ink)] text-white" : "opacity-60 hover:opacity-100"}`}>{item} · {item === "es" ? "MXN" : "USD"}</button>
      ))}
    </div>
  );
}
