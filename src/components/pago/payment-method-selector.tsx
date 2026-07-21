 "use client";

import { CreditCard, Landmark, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePublicLocale } from "@/components/shared/public-locale";

export type CheckoutMethod = "tarjeta" | "oxxo" | "spei";

const METHODS: { id: CheckoutMethod; label: string; icon: typeof CreditCard }[] = [
  { id: "tarjeta", label: "Tarjeta", icon: CreditCard },
  { id: "oxxo", label: "OXXO", icon: QrCode },
  { id: "spei", label: "SPEI", icon: Landmark },
];

export function PaymentMethodSelector({
  value,
  onChange,
}: {
  value: CheckoutMethod;
  onChange: (method: CheckoutMethod) => void;
}) {
  const { locale } = usePublicLocale();
  return (
    <div role="radiogroup" aria-label="Método de pago" className="grid grid-cols-3 gap-3">
      {METHODS.map(({ id, label, icon: Icon }) => {
        const selected = value === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(id)}
            className={cn(
              "flex min-h-[44px] flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selected
                ? "border-primary bg-primary-soft text-primary"
                : "border-border bg-card text-foreground hover:bg-secondary",
            )}
          >
            <Icon className="h-5 w-5" aria-hidden />
            {locale === "en" && id === "tarjeta" ? "Card" : label}
          </button>
        );
      })}
    </div>
  );
}
