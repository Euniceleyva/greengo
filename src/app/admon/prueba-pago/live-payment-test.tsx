"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle2, CircleDollarSign, LoaderCircle, LockKeyhole, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

type PaymentState = {
  paymentStatus: string | null;
  amountMinor: number;
  currency: string;
};

export function LivePaymentTest({
  adminEmail,
  paymentReference,
  paymentReturn,
}: {
  adminEmail: string;
  paymentReference?: string;
  paymentReturn?: string;
}) {
  const [buyerEmail, setBuyerEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [payment, setPayment] = React.useState<PaymentState | null>(null);

  React.useEffect(() => {
    if (!paymentReference) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;

    const refresh = async () => {
      try {
        const response = await fetch(
          `/api/payments/status?reference=${encodeURIComponent(paymentReference)}`,
          { cache: "no-store" },
        );
        if (!response.ok || stopped) return;
        const result = (await response.json()) as PaymentState;
        setPayment(result);
        attempts += 1;
        if (result.paymentStatus !== "approved" && attempts < 12) {
          timer = setTimeout(refresh, 2000);
        }
      } catch {
        setError("No pudimos consultar todavía la confirmación del pago.");
      }
    };

    void refresh();
    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
    };
  }, [paymentReference]);

  async function startPayment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/internal/payments/mercado-pago/live-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buyerEmail }),
      });
      const result = (await response.json()) as {
        checkoutUrl?: string;
        error?: string;
        diagnosticCode?: string;
      };
      if (!response.ok || !result.checkoutUrl) {
        const message = result.error || "No pudimos abrir Mercado Pago.";
        throw new Error(result.diagnosticCode ? `${message} Código: ${result.diagnosticCode}.` : message);
      }
      window.location.assign(result.checkoutUrl);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No pudimos abrir Mercado Pago.");
      setLoading(false);
    }
  }

  const approved = payment?.paymentStatus === "approved";

  return (
    <main className="operations-theme min-h-screen bg-background px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-7 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Administración · uso privado</p>
            <h1 className="mt-2 text-3xl font-bold text-foreground">Prueba productiva de Mercado Pago</h1>
          </div>
          <LockKeyhole className="h-9 w-9 text-primary" aria-hidden />
        </div>

        <section className="rounded-3xl border border-border bg-white p-6 shadow-card sm:p-8">
          {paymentReference ? (
            <div className="text-center">
              {approved ? (
                <CheckCircle2 className="mx-auto h-16 w-16 text-primary" aria-hidden />
              ) : (
                <LoaderCircle className="mx-auto h-16 w-16 animate-spin text-primary" aria-hidden />
              )}
              <h2 className="mt-5 text-2xl font-bold">
                {approved ? "Pago de $9 MXN confirmado" : "Validando la notificación de Mercado Pago"}
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {approved
                  ? "El cobro real, el Webhook y la actualización en la base de datos funcionaron correctamente."
                  : paymentReturn === "failure"
                    ? "Mercado Pago no aprobó el cobro. Puedes volver e intentarlo nuevamente."
                    : "La confirmación puede tardar unos segundos. Esta pantalla se actualiza automáticamente."}
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Link href="/admon/prueba-pago"><Button variant="outline">Nueva prueba</Button></Link>
                <Link href="/admon"><Button>Volver al panel</Button></Link>
              </div>
            </div>
          ) : (
            <form onSubmit={startPayment}>
              <div className="rounded-2xl border border-warning/40 bg-warning-soft p-4 text-sm leading-6 text-foreground">
                <div className="flex gap-3">
                  <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-warning" aria-hidden />
                  <p><strong>Este cobro es real.</strong> Mercado Pago cargará exactamente $9 MXN a la tarjeta utilizada.</p>
                </div>
              </div>

              <div className="mt-7 flex items-center justify-between rounded-2xl border border-border bg-muted/35 p-5">
                <div className="flex items-center gap-3">
                  <CircleDollarSign className="h-8 w-8 text-primary" aria-hidden />
                  <div><p className="text-sm font-bold">Importe fijo de prueba</p><p className="text-xs text-muted-foreground">No modifica las tarifas públicas</p></div>
                </div>
                <strong className="text-2xl">$9 MXN</strong>
              </div>

              <label className="mt-7 block text-sm font-bold text-foreground">
                Correo del comprador
                <input
                  type="email"
                  required
                  value={buyerEmail}
                  onChange={(event) => setBuyerEmail(event.target.value)}
                  placeholder="Usa un correo distinto al vendedor"
                  className="mt-2 h-12 w-full rounded-xl border border-input bg-background px-4 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Sesión administrativa: {adminEmail}. Para evitar el bloqueo comprador-vendedor, usa otro correo en la prueba.
              </p>

              {error && <div role="alert" className="mt-5 rounded-xl border border-destructive/30 bg-destructive-soft p-4 text-sm font-semibold">{error}</div>}

              <Button type="submit" size="lg" disabled={loading} className="mt-7 w-full rounded-xl font-bold">
                {loading && <LoaderCircle className="animate-spin" aria-hidden />}
                {loading ? "Abriendo Mercado Pago" : "Pagar $9 MXN en Mercado Pago"}
              </Button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
