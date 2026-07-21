"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionContextValue {
  openId: string | null;
  toggle: (id: string) => void;
}

const AccordionContext = React.createContext<AccordionContextValue | null>(null);

export function Accordion({
  className,
  children,
  defaultOpenId = null,
}: {
  className?: string;
  children: React.ReactNode;
  defaultOpenId?: string | null;
}) {
  const [openId, setOpenId] = React.useState<string | null>(defaultOpenId);
  const toggle = React.useCallback((id: string) => {
    setOpenId((current) => (current === id ? null : id));
  }, []);

  return (
    <AccordionContext.Provider value={{ openId, toggle }}>
      <div className={cn("divide-y-2 divide-dashed divide-tropical-border rounded-2xl border-2 border-tropical-border bg-tropical-card", className)}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({ id, question, answer }: { id: string; question: string; answer: string }) {
  const ctx = React.useContext(AccordionContext);
  if (!ctx) throw new Error("AccordionItem debe usarse dentro de Accordion");
  const isOpen = ctx.openId === id;
  const panelId = `accordion-panel-${id}`;
  const buttonId = `accordion-trigger-${id}`;

  return (
    <div>
      <h3>
        <button
          id={buttonId}
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => ctx.toggle(id)}
          className="flex w-full min-h-[44px] items-center justify-between gap-4 px-5 py-4 text-left font-urbanist text-sm font-bold text-tropical-text transition-colors hover:bg-tropical-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tropical-secondary focus-visible:ring-inset sm:text-base"
        >
          {question}
          <ChevronDown
            aria-hidden
            className={cn("h-5 w-5 shrink-0 text-tropical-accent transition-transform", isOpen && "rotate-180")}
          />
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!isOpen}
        className="px-5 pb-4 text-sm text-tropical-muted"
      >
        {answer}
      </div>
    </div>
  );
}
