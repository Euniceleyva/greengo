"use client";

// Primitivas de formulario y botón EXCLUSIVAS del sistema visual público
// (Landing, /reservar, /pago, /destinos). No se usan en /admin ni /driver:
// se crearon aparte para no forzar el rediseño dentro de los componentes
// compartidos con el panel administrativo (src/components/ui/button.tsx,
// src/components/ui/input.tsx).

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "accent" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg" | "icon";

const buttonVariants: Record<ButtonVariant, string> = {
  default:
    "bg-gradient-tropical text-white shadow-sketch hover:brightness-105 active:brightness-95 focus-visible:ring-tropical-primary",
  accent:
    "bg-gradient-sun text-white shadow-sketch hover:brightness-105 active:brightness-95 focus-visible:ring-tropical-accent",
  outline:
    "border-2 border-tropical-dark/70 bg-transparent text-tropical-dark hover:bg-tropical-dark/5 focus-visible:ring-tropical-dark",
  ghost: "bg-transparent text-tropical-dark hover:bg-tropical-primary/10 focus-visible:ring-tropical-primary",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-xs",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-base",
  icon: "h-11 w-11",
};

export interface PublicButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = React.forwardRef<HTMLButtonElement, PublicButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "group relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-urbanist font-bold tracking-tight transition-all duration-200 ease-out",
        "hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-tropical-background",
        "disabled:pointer-events-none disabled:opacity-50 disabled:hover:translate-y-0",
        "[&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0 motion-reduce:hover:translate-y-0 motion-reduce:transition-none",
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "PublicButton";

const fieldBase =
  "flex w-full rounded-xl border-2 border-tropical-border bg-tropical-card px-3.5 py-2 text-sm text-tropical-text placeholder:text-tropical-muted/70 transition-colors focus-visible:outline-none focus-visible:border-tropical-secondary focus-visible:ring-2 focus-visible:ring-tropical-secondary/30 disabled:cursor-not-allowed disabled:opacity-50";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input type={type} ref={ref} className={cn(fieldBase, "h-11", className)} {...props} />
  ),
);
Input.displayName = "PublicInput";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(fieldBase, "min-h-[96px]", className)} {...props} />
  ),
);
Textarea.displayName = "PublicTextarea";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(fieldBase, "h-11 appearance-none pr-9", className)}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-tropical-muted"
      />
    </div>
  ),
);
Select.displayName = "PublicSelect";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("font-urbanist text-sm font-semibold text-tropical-text", className)} {...props} />;
}

export function FieldError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="mt-1.5 text-xs font-medium text-red-700">
      {children}
    </p>
  );
}

export function HelpText({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <p className="mt-1.5 text-xs text-tropical-muted">{children}</p>;
}
