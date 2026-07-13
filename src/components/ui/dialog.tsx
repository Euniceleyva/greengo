"use client";

// Modal accesible ligero. Cierra con ESC o al hacer clic en el fondo.
import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  /** side: modal centrado (por defecto) o panel lateral derecho */
  side?: boolean;
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  className,
  side = false,
}: DialogProps) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[900] flex bg-black/40 p-0 sm:p-4",
        side ? "justify-end" : "items-center justify-center",
      )}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "flex max-h-full w-full flex-col overflow-hidden bg-card shadow-xl animate-fade-in",
          side
            ? "h-full max-w-md rounded-none sm:rounded-l-lg"
            : "max-w-lg rounded-t-lg sm:rounded-lg",
          className,
        )}
      >
        {(title || description) && (
          <div className="flex items-start justify-between border-b border-border p-5">
            <div>
              {title && <h2 className="text-lg font-semibold">{title}</h2>}
              {description && (
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Cerrar">
              <X />
            </Button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}
