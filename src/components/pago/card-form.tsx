"use client";

import { forwardRef, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cardPaymentSchema, type CardPaymentValues } from "@/lib/schemas";
import { formatCardNumber, formatExpiry } from "@/lib/utils";
import { Input, Label } from "@/components/ui/input";

export interface CardFormHandle {
  submit: () => Promise<CardPaymentValues | null>;
}

export const CardForm = forwardRef<CardFormHandle>(function CardForm(_props, ref) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CardPaymentValues>({
    resolver: zodResolver(cardPaymentSchema),
    defaultValues: { cardNumber: "", cardName: "", expiry: "", cvv: "" },
  });

  const cardNumberReg = register("cardNumber");
  const expiryReg = register("expiry");
  const cvvReg = register("cvv");

  useImperativeHandle(ref, () => ({
    submit: () =>
      new Promise((resolve) => {
        handleSubmit(
          (data) => resolve(data),
          () => resolve(null),
        )();
      }),
  }));

  return (
    <form className="grid gap-5 sm:grid-cols-2" noValidate>
      <div className="sm:col-span-2">
        <Label htmlFor="cardNumber">Número de tarjeta</Label>
        <Input
          id="cardNumber"
          inputMode="numeric"
          placeholder="0000 0000 0000 0000"
          className="mt-1.5"
          {...cardNumberReg}
          onChange={(e) => {
            e.target.value = formatCardNumber(e.target.value);
            cardNumberReg.onChange(e);
          }}
        />
        {errors.cardNumber && <p className="mt-1.5 text-xs text-destructive">{errors.cardNumber.message}</p>}
      </div>

      <div className="sm:col-span-2">
        <Label htmlFor="cardName">Nombre en la tarjeta</Label>
        <Input id="cardName" className="mt-1.5" {...register("cardName")} />
        {errors.cardName && <p className="mt-1.5 text-xs text-destructive">{errors.cardName.message}</p>}
      </div>

      <div>
        <Label htmlFor="expiry">Vigencia (MM/AA)</Label>
        <Input
          id="expiry"
          inputMode="numeric"
          placeholder="MM/AA"
          className="mt-1.5"
          {...expiryReg}
          onChange={(e) => {
            e.target.value = formatExpiry(e.target.value);
            expiryReg.onChange(e);
          }}
        />
        {errors.expiry && <p className="mt-1.5 text-xs text-destructive">{errors.expiry.message}</p>}
      </div>

      <div>
        <Label htmlFor="cvv">CVV</Label>
        <Input
          id="cvv"
          inputMode="numeric"
          placeholder="123"
          className="mt-1.5"
          {...cvvReg}
          onChange={(e) => {
            e.target.value = e.target.value.replace(/\D/g, "").slice(0, 4);
            cvvReg.onChange(e);
          }}
        />
        {errors.cvv && <p className="mt-1.5 text-xs text-destructive">{errors.cvv.message}</p>}
      </div>
    </form>
  );
});
