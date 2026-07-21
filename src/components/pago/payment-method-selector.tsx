import { CreditCard, Landmark, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";

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
  return (
    <div role="radiogroup" aria-label="Método de pago" className="adventure-payment-methods">
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
              "adventure-payment-method",
              selected
                ? "adventure-payment-method--selected"
                : "text-foreground",
            )}
          >
            <Icon className="h-5 w-5" aria-hidden />
            {label}
          </button>
        );
      })}
    </div>
  );
}
